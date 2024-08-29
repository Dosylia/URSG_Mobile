import React from 'react';
import { Text } from 'react-native';
import ProfileSection from './ProfileSection';
import LeagueDataComponent from './LeagueDataComponent';
import { useTranslation } from 'react-i18next';

const LookingForSection = ({ userData }) => {
  const { t } = useTranslation();
  const genderLf = userData?.genderLf || 'Not specified';
  const kindOfGamerLf = userData?.kindOfGamerLf || 'Not specified';

  return (
    <ProfileSection title={t('looking-for')}>
      {userData && (
        <>
          {/* League Data Component */}
          {userData.main1Lf && userData.main2Lf && userData.main3Lf && userData.roleLf && userData.rankLf && (
            <LeagueDataComponent
              main1={userData.main1Lf}
              main2={userData.main2Lf}
              main3={userData.main3Lf}
              role={userData.roleLf}
              rank={userData.rankLf}
            />
          )}
          <Text className="text-white">{`${t('gender')}: ${genderLf}`}</Text>
          <Text className="text-white">{`${t('kind-of-gamer')}: ${kindOfGamerLf}`}</Text>
        </>
      )}
    </ProfileSection>
  );
};

export default LookingForSection;