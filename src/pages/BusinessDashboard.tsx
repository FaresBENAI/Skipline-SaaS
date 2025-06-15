import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
// ... (gardez tous les autres imports)

const BusinessDashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  // ... (gardez tous les autres states)

  // ... (gardez toutes les autres fonctions)

  // AJOUTEZ cette fonction pour naviguer vers la gestion
  const handleQueueClick = (queue: Queue) => {
    console.log('🎯 Navigation vers gestion file:', queue.id)
    navigate(`/business/queue/${queue.id}`)
  }

  // Dans le rendu, REMPLACEZ la div qui liste les files par :
  <div className="space-y-3">
    {queues.map((queue) => (
      <div
        key={queue.id}
        onClick={() => handleQueueClick(queue)}
        className="p-4 rounded-lg border-2 cursor-pointer transition-colors border-gray-200 hover:border-blue-300 hover:bg-blue-50"
      >
        <h3 className="font-semibold text-gray-900">{queue.name}</h3>
        <p className="text-sm text-gray-600 mt-1">🟢 Active • Cliquez pour gérer</p>
      </div>
    ))}
  </div>

  // ... (gardez le reste du code)
