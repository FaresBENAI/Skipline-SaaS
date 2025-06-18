import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, from = 'noreply@skipline.app' } = await req.json()

    // Initialiser Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Configuration email provider (Resend - gratuit jusqu'à 3000 emails/mois)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY non configurée, simulation envoi...')
      
      // Logger comme envoyé pour les tests
      await supabaseClient
        .from('notification_logs')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('recipient', to)
        .eq('channel', 'email')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: 'test-' + Date.now(),
          message: 'Email simulé (mode test)' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Envoyer email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      // Logger l'échec
      await supabaseClient
        .from('notification_logs')
        .update({ 
          status: 'failed', 
          error_message: emailResult.message || 'Erreur inconnue'
        })
        .eq('recipient', to)
        .eq('channel', 'email')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      throw new Error(`Erreur Resend: ${emailResult.message}`)
    }

    // Logger le succès
    await supabaseClient
      .from('notification_logs')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
      .eq('recipient', to)
      .eq('channel', 'email')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResult.id,
        message: 'Email envoyé avec succès' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur envoi email:', error)
    
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
