import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null); // To store user profile data like username, avatar

    useEffect(() => {
        const getSession = async () => {
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error getting session:", error);
                setLoading(false);
                return;
            }
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, currentSession) => {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setLoading(false);
                if (currentSession?.user && !profile) { // Fetch profile if user logs in and profile not yet loaded
                    fetchUserProfile(currentSession.user.id);
                } else if (!currentSession?.user) {
                    setProfile(null); // Clear profile on logout
                }
            }
        );

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // Fetch user profile from 'users' table
    const fetchUserProfile = async (userId) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, email, gender, avatar_url')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error.message);
                setProfile(null); // Set profile to null or some error state
            } else {
                setProfile(data);
            }
        } catch (e) {
            console.error('Exception fetching user profile:', e);
            setProfile(null);
        }
    };

    // Fetch profile when user state changes and profile is not yet loaded
    useEffect(() => {
        if (user && !profile) {
            fetchUserProfile(user.id);
        }
    }, [user]);


    const value = {
        session,
        user,
        profile, // Add profile to context
        fetchUserProfile, // Expose function to refetch profile if needed
        signOut: () => supabase.auth.signOut(),
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};