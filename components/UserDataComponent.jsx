import React, { useEffect } from 'react';

const UserDataComponent = ({ sessions, onUserDataChange }) => {
  useEffect(() => {
    if (
      sessions.googleSession && Object.keys(sessions.googleSession).length > 0 &&
      sessions.userSession && Object.keys(sessions.userSession).length > 0 &&
      sessions.leagueSession && Object.keys(sessions.leagueSession).length > 0 &&
      sessions.lookingforSession && Object.keys(sessions.lookingforSession).length > 0
    ) {
      const newUserData = {
        googleId: sessions.googleSession.googleId,
        userId: sessions.userSession.userId,
        email: sessions.googleSession.email,
        username: sessions.userSession.username,
        gender: sessions.userSession.gender,
        age: sessions.userSession.age,
        kindOfGamer: sessions.userSession.kindOfGamer,
        game: sessions.userSession.game,
        shortBio: sessions.userSession.shortBio,
        picture : sessions.userSession.picture,
        discord : sessions.userSession.discord,
        instagram : sessions.userSession.instagram,
        twitch : sessions.userSession.twitch,
        twitter : sessions.userSession.twitter,
        currency : sessions.userSession.currency,
        isVip : sessions.userSession.isVip,
        main1: sessions.leagueSession.main1,
        main2: sessions.leagueSession.main2,
        main3: sessions.leagueSession.main3,
        rank: sessions.leagueSession.rank,
        role: sessions.leagueSession.role,
        server: sessions.leagueSession.server,
        account : sessions.leagueSession.account,
        sUsername : sessions.leagueSession.sUsername,
        sRank : sessions.leagueSession.sRank,
        sLevel : sessions.leagueSession.sLevel,
        sProfileIcon : sessions.leagueSession.sProfileIcon,
        genderLf: sessions.lookingforSession.lfGender,
        kindOfGamerLf: sessions.lookingforSession.lfKingOfGamer,
        gameLf: sessions.lookingforSession.lfGame,
        main1Lf: sessions.lookingforSession.main1Lf,
        main2Lf: sessions.lookingforSession.main2Lf,
        main3Lf: sessions.lookingforSession.main3Lf,
        rankLf: sessions.lookingforSession.rankLf,
        roleLf: sessions.lookingforSession.roleLf
      };
      
      // Call the callback function to pass the data up
      onUserDataChange(newUserData);
    }
  }, [sessions, onUserDataChange]);

  return null; // This component does not render anything
};

export default UserDataComponent;