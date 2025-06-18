import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message, from = 'SkipLine' } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Configuration Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log('Variables Twilio manquantes, simulation SMS...')
      
      // Logger comme envoyé pour les tests
      await supabaseClient
        .from('notification_logs')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('recipient', to)
        .eq('channel', 'sms')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: 'sms-test-' + Date.now(),
          message: 'SMS simulé (mode test)' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Envoyer SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    
    const formData = new URLSearchParams()
    formData.append('To', to)
    formData.append('From', twilioPhoneNumber)
    formData.append('Body', message)

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    const twilioResult = await twilioResponse.json()

    if (!twilioResponse.ok) {
      // Logger l'échec
      await supabaseClient
        .from('notification_logs')
        .update({ 
          status: 'failed', 
          error_message: twilioResult.message || 'Erreur Twilio'
        })
        .eq('recipient', to)
        .eq('channel', 'sms')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      throw new Error(`Erreur Twilio: ${twilioResult.message}`)
    }

    // Logger le succès
    await supabaseClient
      .from('notification_logs')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
      .eq('recipient', to)
      .eq('channel', 'sms')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: twilioResult.sid,
        message: 'SMS envoyé avec succès' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur envoi SMS:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
