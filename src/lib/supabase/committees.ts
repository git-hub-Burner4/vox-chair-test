// src/lib/supabase/committees.ts
import { createClient } from './client';

export type CommitteeData = {
  id?: string;
  name: string;
  abbrev: string;
  agenda: string;
  chair: string;
  coChair: string;
  rapporteur: string;
  settings: any;
  member_count?: number;
  last_accessed?: string;
  created_at?: string;
};

export type CommitteeMember = {
  name: string;
  code: string;
  attendance: 'present' | 'present-voting' | 'absent';
};

/**
 * Save a new committee to Supabase
 */
export async function saveCommitteeToDatabase(
  committeeData: CommitteeData,
  members: CommitteeMember[]
) {
  const supabase = createClient();

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insert committee
    const { data: committee, error: committeeError } = await supabase
      .from('committee_sessions')
      .insert({
        user_id: user?.id,
        name: committeeData.name,
        abbrev: committeeData.abbrev,
        agenda: committeeData.agenda,
        settings: {
          chair: committeeData.chair,
          coChair: committeeData.coChair,
          rapporteur: committeeData.rapporteur,
          ...committeeData.settings
        }
      })
      .select()
      .single();

    if (committeeError) throw committeeError;

    // Insert members
    if (members.length > 0) {
      const { error: membersError } = await supabase
        .from('session_countries')
        .insert(
          members.map(member => ({
            session_id: committee.committee_id,
            name: member.name,
            code: member.code,
            attendance: member.attendance,
            updated_at: new Date().toISOString()
          }))
        );

      if (membersError) throw membersError;
    }

    return committee;
  } catch (error) {
    console.error('Error saving committee:', error);
    throw error;
  }
}

/**
 * Get recent committees for current user
 */
export async function getRecentCommittees(limit: number = 6) {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user, returning empty array');
      return [];
    }

    const { data: committees, error } = await supabase
      .from('committee_sessions')
      .select(`
        id,
        committee_id,
        name,
        abbrev,
        agenda,
        settings,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    if (!committees || committees.length === 0) {
      console.log('No committees found for user');
      return [];
    }

    // Get member counts for each committee
    const committeesWithCounts = await Promise.all(
      committees.map(async (committee) => {
        const { count } = await supabase
          .from('session_countries')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', committee.committee_id);

        return {
          id: committee.committee_id,
          name: committee.name,
          abbrev: committee.abbrev,
          agenda: committee.agenda,
          settings: committee.settings,
          members: count || 0,
          lastAccessed: getRelativeTime(committee.updated_at),
          createdAt: committee.created_at
        };
      })
    );

    return committeesWithCounts;
  } catch (error) {
    console.error('Error fetching recent committees:', error);
    return [];
  }
}

/**
 * Get a specific committee by ID
 */
export async function getCommitteeById(committeeId: string) {
  const supabase = createClient();

  try {
    // Get committee data
    const { data: committee, error: committeeError } = await supabase
      .from('committee_sessions')
      .select('*')
      .eq('committee_id', committeeId)
      .single();

    if (committeeError) throw committeeError;

    // Get members
    const { data: members, error: membersError } = await supabase
      .from('session_countries')
      .select('*')
      .eq('session_id', committeeId);

    if (membersError) throw membersError;

    return {
      ...committee,
      countries: members.map(m => ({
        name: m.name,
        code: m.code,
        attendance: m.attendance
      })),
      countryList: members.map(m => ({
        id: m.code.toLowerCase(),
        name: m.name,
        code: m.code.toLowerCase(),
        flagQuery: m.code.toLowerCase(),
        attendance: m.attendance
      }))
    };
  } catch (error) {
    console.error('Error fetching committee:', error);
    throw error;
  }
}

/**
 * Update committee's last accessed time
 */
export async function updateCommitteeAccess(committeeId: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('committee_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('committee_id', committeeId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating committee access:', error);
  }
}

/**
 * Delete a committee
 */
export async function deleteCommittee(committeeId: string) {
  const supabase = createClient();

  try {
    // Delete members first (cascade should handle this, but being explicit)
    await supabase
      .from('session_countries')
      .delete()
      .eq('session_id', committeeId);

    // Delete committee
    const { error } = await supabase
      .from('committee_sessions')
      .delete()
      .eq('committee_id', committeeId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting committee:', error);
    throw error;
  }
}

/**
 * Helper function to get relative time (e.g., "2 hours ago")
 */
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}