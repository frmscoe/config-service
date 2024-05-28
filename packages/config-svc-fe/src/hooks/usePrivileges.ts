import { useMemo } from 'react';
import { useAuth } from '~/context/auth';

//Add any Privileges
const usePrivileges = () => {
    const {profile: user} = useAuth();
    
    const canCreateRuleConfig = useMemo(() => {
        return user?.privileges?.includes('SECURITY_CREATE_RULE_CONFIG');
    }, [user]);

    const canViewRules = useMemo(() => {
        return user?.privileges?.includes('SECURITY_GET_RULES');
    }, [user]);

    const canViewRuleConfigs = useMemo(() => {
        return user?.privileges?.includes('SECURITY_GET_RULE_CONFIGS');
    }, [user]);

    const canViewRuleWithConfigs = useMemo(() => {
        return user?.privileges?.includes('SECURITY_GET_RULE_RULE_CONFIG');
    },[user])

    const canEditRule = useMemo(() => {
        return user?.privileges?.includes('SECURITY_UPDATE_RULE');
    }, [user]);

    const canReviewRule = useMemo(() => {
        return user?.privileges?.includes('SECURITY_GET_RULE');
    }, [user]);

    const canEditConfig = useMemo(() => {
        return user?.privileges?.includes('SECURITY_UPDATE_RULE_CONFIG');
    }, [user]);

    const canReviewConfig = useMemo(() => {
        return user?.privileges?.includes('SECURITY_GET_RULE_CONFIG');
    }, [user]);

    return {
        canCreateRuleConfig,
        canEditRule,
        canReviewRule,
        canEditConfig,
        canReviewConfig,
        privileges: user.privileges || [],
        canViewRules,
        canViewRuleConfigs,
        canViewRuleWithConfigs
    };
};

export default usePrivileges;
