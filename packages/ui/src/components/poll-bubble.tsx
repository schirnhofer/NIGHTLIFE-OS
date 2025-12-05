/**
 * Poll-Bubble Komponente
 * 
 * Phase 6: Umfrage-Anzeige und Voting
 * - Frage + Optionen
 * - Voting-Buttons
 * - Ergebnis-Anzeige (Anzahl + Prozent)
 * - Markierung eigener Votes (grüner Haken)
 */

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

export interface PollData {
  question: string;
  options: string[];
  votes: Record<number, string[]>; // optionIndex -> Array von UIDs
  allowMultipleVotes?: boolean;
  expiresAt?: number;
}

export interface PollBubbleProps {
  poll: PollData;
  currentUserId: string | null | undefined;
  onVote?: (optionIndex: number) => void;
  className?: string;
}

/**
 * Poll-Bubble
 * 
 * Zeigt Umfrage mit Optionen und Ergebnissen
 */
export function PollBubble({
  poll,
  currentUserId,
  onVote,
  className
}: PollBubbleProps) {
  const { question, options, votes, allowMultipleVotes, expiresAt } = poll;

  // Prüfe ob abgelaufen
  const isExpired = expiresAt ? Date.now() > expiresAt : false;

  // Berechne Gesamt-Votes
  const totalVotes = Object.values(votes || {}).reduce(
    (sum, voterIds) => sum + (voterIds?.length || 0),
    0
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Frage */}
      <h3 className="text-base font-semibold">{question}</h3>

      {/* Optionen */}
      <div className="space-y-2">
        {options?.map((option, index) => {
          const optionVotes = votes?.[index] || [];
          const optionVoteCount = optionVotes?.length || 0;
          const percentage =
            totalVotes > 0 ? Math.round((optionVoteCount / totalVotes) * 100) : 0;
          const hasVotedThisOption = optionVotes?.includes(currentUserId || '');

          return (
            <button
              key={index}
              onClick={() => {
                if (!isExpired && onVote) {
                  onVote(index);
                }
              }}
              disabled={isExpired}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg transition-colors relative overflow-hidden',
                hasVotedThisOption
                  ? 'bg-green-700 text-white border-2 border-green-500'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600',
                isExpired && 'opacity-60 cursor-not-allowed'
              )}
            >
              {/* Progressbar */}
              {totalVotes > 0 && (
                <div
                  className="absolute inset-0 bg-cyan-600/20 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}

              {/* Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasVotedThisOption && (
                    <Check className="h-4 w-4 text-green-300" />
                  )}
                  <span className="text-sm">{option}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold">{optionVoteCount}</span>
                  {totalVotes > 0 && (
                    <span className="opacity-70">({percentage}%)</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {totalVotes} {totalVotes === 1 ? 'Stimme' : 'Stimmen'}
        </span>
        {allowMultipleVotes && (
          <span className="italic">Mehrfachauswahl erlaubt</span>
        )}
        {isExpired && (
          <span className="text-red-400 font-semibold">Abgelaufen</span>
        )}
      </div>
    </div>
  );
}
