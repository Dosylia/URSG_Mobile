import React from 'react';
import { Text } from 'react-native';
import ProfileSection from './ProfileSection';
import LeagueDataComponent from './LeagueDataComponent';
import ValorantDataComponent from './ValorantDataComponent'; // Assuming you have this component
import { useTranslation } from 'react-i18next';

const LookingForSection = ({ userData }) => {
  const { t } = useTranslation();
  const genderLf = userData?.genderLf || 'Not specified';
  const kindOfGamerLf = userData?.kindOfGamerLf || 'Not specified';

  return (
    <ProfileSection title={t('looking-for')}>
      {userData && (
        <>
          {/* Render League or Valorant Data Component based on userData.game */}
          {userData.game === "League of Legends" ? (
            userData.main1Lf && userData.main2Lf && userData.main3Lf && userData.roleLf && userData.rankLf && (
              <LeagueDataComponent
                main1={userData.main1Lf}
                main2={userData.main2Lf}
                main3={userData.main3Lf}
                role={userData.roleLf}
                rank={userData.rankLf}
              />
            )
          ) : (
            userData.valmain1Lf && userData.valmain2Lf && userData.valmain3Lf && userData.valroleLf && userData.valrankLf && (
              <ValorantDataComponent
                main1={userData.valmain1Lf}
                main2={userData.valmain2Lf}
                main3={userData.valmain3Lf}
                role={userData.valroleLf}
                rank={userData.valrankLf}
              />
            )
          )}
          
          {/* Other userData fields */}
          <Text className="text-white dark:text-blackPerso">{`${t('gender')}: ${genderLf}`}</Text>
          <Text className="text-white dark:text-blackPerso">{`${t('kind-of-gamer')}: ${kindOfGamerLf}`}</Text>
        </>
      )}
    </ProfileSection>
  );
};

export default LookingForSection;
