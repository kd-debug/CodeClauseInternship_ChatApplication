import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

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
            if (currentSession?.user) {
                fetchUserProfile(currentSession.user.id);
            }
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, currentSession) => {
                setSession(currentSession);
                const newAuthUser = currentSession?.user ?? null;
                setUser(newAuthUser);
                if (newAuthUser) {
                    fetchUserProfile(newAuthUser.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (userId) => {
        if (!userId) {
            setProfile(null); // Clear profile if no userId
            return;
        }
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, email, gender, avatar_url')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error.message);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (e) {
            console.error('Exception fetching user profile:', e);
            setProfile(null);
        }
    };

    // This useEffect is redundant if fetchUserProfile is called within onAuthStateChange and getSession
    // useEffect(() => {
    //     if (user && !profile) { // Condition might be too restrictive if profile fetch failed once
    //         fetchUserProfile(user.id);
    //     }
    // }, [user, profile]); // Depending on profile here can cause loops if fetchUserProfile sets profile to null on error


    const value = {
        session,
        user,
        profile,
        fetchUserProfile,
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