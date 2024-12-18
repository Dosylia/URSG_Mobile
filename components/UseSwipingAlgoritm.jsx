import { useState, useEffect } from 'react';

const UseSwipeAlgorithm = ({ reshapedUserData, allUsers }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [profileList, setProfileList] = useState([]);
    const [championList, setChampionList] = useState([]);
    const [championValo, setChampionValo] = useState([]);

    class Champion {
        constructor(name, lane, championtype, damagetype, speciality) {
            this.name = name;
            this.lane = lane;
            this.championtype = championtype;
            this.damagetype = damagetype;
            this.speciality = speciality;
        }
    }

    class Champion_Valo {
        constructor(name, champion_class) {
            this.name = name;
            this.champion_class = champion_class;
        }

    }

    useEffect(() => {
        // Transform usersAllData into Profile instances
        const profiles = allUsers.map(obj => ({
            userid: obj.user_id,
            gender: obj.user_gender,
            age: obj.user_age,
            gamerkind: obj.user_kindOfGamer,
            game: obj.user_game,
            serverLol: obj.lol_server,
            mainLol1: obj.lol_main1,
            mainLol2: obj.lol_main2,
            mainLol3: obj.lol_main3,
            rankLol: obj.lol_rank,
            roleLol: obj.lol_role,
            serverValo: obj.valorant_server,
            valorant_id: obj.valorant_id,
            mainValo1: obj.valorant_main1,
            mainValo2: obj.valorant_main2,
            mainValo3: obj.valorant_main3,
            rankValo: obj.valorant_rank,
            roleValo: obj.valorant_mole,
            lookingGender: obj.lf_gender,
            lookingGamerkind: obj.lf_kindofgamer,
            lookingGame: obj.lf_game,
            lookingMainLol1: obj.lf_lolmain1,
            lookingMainLol2: obj.lf_lolmain2,
            lookingMainLol3: obj.lf_lolmain3,
            lookingRankLol: obj.lf_lolrank,
            lookingRoleLol: obj.lf_lolrole,
            lookingMainValo1: obj.lf_valmain1,
            lookingMainValo2: obj.lf_valmain2,
            lookingMainValo3: obj.lf_valmain3,
            lookingRankValo: obj.lf_valrank,
            lookingRoleValo: obj.lf_valrole
        }));

        setProfileList(profiles);
        // console.log('User data algo:', reshapedUserData)
        // Set the current user's profile
        const user = {
            userid: reshapedUserData.user_id,
            gender: reshapedUserData.user_gender,
            age: reshapedUserData.user_age,
            gamerkind: reshapedUserData.user_kindOfGamer,
            game: reshapedUserData.user_game,
            serverLol: reshapedUserData.lol_server,
            mainLol1: reshapedUserData.lol_main1,
            mainLol2: reshapedUserData.lol_main2,
            mainLol3: reshapedUserData.lol_main3,
            rankLol: reshapedUserData.lol_rank,
            roleLol: reshapedUserData.lol_role,
            serverValo: reshapedUserData.valorant_server,
            valorant_id: reshapedUserData.valorant_id,
            mainValo1: reshapedUserData.valorant_main1,
            mainValo2: reshapedUserData.valorant_main2,
            mainValo3: reshapedUserData.valorant_main3,
            rankValo: reshapedUserData.valorant_rank,
            roleValo: reshapedUserData.valorant_mole,
            lookingGender: reshapedUserData.lf_gender,
            lookingGamerkind: reshapedUserData.lf_kindofgamer,
            lookingGame: reshapedUserData.lf_game,
            lookingMainLol1: reshapedUserData.lf_lolmain1,
            lookingMainLol2: reshapedUserData.lf_lolmain2,
            lookingMainLol3: reshapedUserData.lf_lolmain3,
            lookingRankLol: reshapedUserData.lf_lolrank,
            lookingRoleLol: reshapedUserData.lf_lolrole,
            lookingMainValo1: reshapedUserData.lf_valmain1,
            lookingMainValo2: reshapedUserData.lf_valmain2,
            lookingMainValo3: reshapedUserData.lf_valmain3,
            lookingRankValo: reshapedUserData.lf_valrank,
            lookingRoleValo: reshapedUserData.lf_valrole
        };

        setUserProfile(user);
    }, []);

    useEffect(() => {
        const loadChampionsLol = async () => {
            try {
                const response = await fetch('https://ur-sg.com/public/js/Champions.txt');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const text = await response.text();
                const lines = text.split('\n'); // Split text into lines

                const champions = lines.map(line => {
                    const [name, lane, championtype, damagetype, speciality] = line.split(";");
                    return new Champion(name, lane, championtype, damagetype, speciality.replace(/\r/g, ''));
                });
                setChampionList(champions);
            } catch (error) {
                console.error('There was a problem loading the LoL champions file:', error);
            }
        };

        const loadChampionsValo = async () => {
            try {
                const response = await fetch('https://ur-sg.com/public/js/Valorant_Champions.txt');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const text = await response.text();
                const lines = text.split('\n'); // Split text into lines

                const valoChampions = lines.map(line => {
                    const [name, champion_class] = line.split(";");
                    return new Champion_Valo(name, champion_class);
                });
                setChampionValo(valoChampions);
            } catch (error) {
                console.error('There was a problem loading the Valorant champions file:', error);
            }
        };

        loadChampionsLol();
        loadChampionsValo();
    }, []);

    //Here are all the matching functions for the algorythm

    //More simple champion matching functions since the other one went crazy
    function champion_match_new(
        userMain1,
        userMain2,
        userMain3,
        userLookingMain1,
        userLookingMain2,
        userLookingMain3,
        matchMain1,
        matchMain2,
        matchMain3,
        matchLookingMain1,
        matchLookingMain2,
        matchLookingMain3,
    ) {
        //create an array for each user Mains and looking for champions
        var score = 0
        const userMains = [userMain1, userMain2, userMain3];
        const userLookingMains = [userLookingMain1, userLookingMain2, userLookingMain3];
        const matchMains = [matchMain1, matchMain2, matchMain3];
        const matchLookingMains = [matchLookingMain1, matchLookingMain2, matchLookingMain3];

        // Compare the arrays 
        function findMatches(mainArray, lookingArray) {
            mainArray.forEach(champ => {
                if (lookingArray.includes(champ)) {
                    score += 40;  // raise the score if a match is found
                }
            });
        }
        //match the main user looking for to the match user mains
        findMatches(userMains, matchLookingMains);
        findMatches(matchMains, userLookingMains);

        // Return the score
        return score;
    }

    //Very complex Champion Matching League
    function champion_match(
        userMain1,
        userMain2,
        userMain3,
        userLookingMain1,
        userLookingMain2,
        userLookingMain3,
        matchMain1,
        matchMain2,
        matchMain3,
        matchLookingMain1,
        matchLookingMain2,
        matchLookingMain3,
    ) {
        const championsInUse = [0, 1, 2, 3, 4, 5];
        const lookingForChamps = [0, 1, 2, 3, 4, 5];


        for (let i = 0; i < champion_list.length; i++) {
            const Champion = champion_list[i];

            if (Champion.name === userMain1) {
                championsInUse[0] = Champion;
            } if (Champion.name === userMain2) {
                championsInUse[1] = Champion;
            } if (Champion.name === userMain3) {
                championsInUse[2] = Champion;
            } if (Champion.name === matchMain1) {
                championsInUse[3] = Champion;
            } if (Champion.name === matchMain2) {
                championsInUse[4] = Champion;
            } if (Champion.name === matchMain3) {
                championsInUse[5] = Champion;
            } if (Champion.name === userLookingMain1) {
                lookingForChamps[0] = Champion
            } if (Champion.name === userLookingMain2) {
                lookingForChamps[1] = Champion
            } if (Champion.name === userLookingMain3) {
                lookingForChamps[2] = Champion
            } if (Champion.name === matchLookingMain1) {
                lookingForChamps[3] = Champion
            } if (Champion.name === matchLookingMain2) {
                lookingForChamps[4] = Champion
            } if (Champion.name === matchLookingMain3) {
                lookingForChamps[5] = Champion
            }

        }
        const user_champions = championsInUse.slice(0, 3); // Select the first three champions
        const comparison_champions = championsInUse.slice(3); // Select the second three champions
        const user_lookingFor = lookingForChamps.slice(0, 3);// Select the first three champions
        const match_lookingFor = lookingForChamps.slice(3);// Select the second three champions

        let score = 0;

        for (let i = 0; i < user_lookingFor.length; i++) {
            const champion_user = user_lookingFor[i]
            for (let j = 0; j < comparison_champions.length; j++) {
                const champion_match = comparison_champions[j]

                if (champion_user.name === champion_match.name) {
                    score += 20
                }
            }
        }

        for (let i = 0; i < match_lookingFor.length; i++) {
            const champion_user = match_lookingFor[i]
            for (let j = 0; j < user_champions.length; j++) {
                const champion_match = user_champions[j]
                if (champion_user.name === champion_match.name) {
                    score += 20
                }
            }
        }



        for (let i = 0; i < comparison_champions.length; i++) {
            const champion = comparison_champions[i];
            for (let j = 0; j < user_champions.length; j++) {
                const user_champion = user_champions[j];

                if (user_champion.name === champion.name) {
                    continue
                }
                // Compare lane
                score += compare_lane(champion.lane, user_champion.lane)

                // Compare class
                score += compare_class(champion.championtype, user_champion.championtype)

                // Compare damage type
                score += compare_damagetype(champion.damagetype, user_champion.damagetype)

                // Compare specialty
                score += compare_speciallty(champion.speciality, user_champion.speciality)



            }
        }

        return score;
    }

    function compare_lane(champion_lane, user_lane) {

        const lane_Scores = {
            'top-mid': 0.7,
            'top-jungle': 0.8,
            'top-adc': 0.2,
            'top-support': 0.2,
            'jungle-mid': 0.7,
            'jungle-adc': 0.7,
            'jungle-supp': 0.7,
            'jungle-top': 0.8,
            'mid-adc': 0.7,
            'mid-support': 0.8,
            'mid-jungle': 1,
            'mid-top': 0.7,
            'adc-top': 0.2,
            'adc-jungle': 0.7,
            'adc-mid': 0.7,
            'adc-support': 1,
            'support-top': 0.2,
            'support-jungle': 0.7,
            'support-mid': 0.8,
            'support-adc': 1
        };

        // Create lane combination string
        const laneCombination = `${champion_lane}-${user_lane}`;

        // Check if lane combination exists in laneScores object
        if (laneCombination in lane_Scores) {
            return lane_Scores[laneCombination];
        } else {
            const split_champion = champion_lane.split('/')
            const split_user = user_lane.split('/')
            var divider = 0
            var score = 0

            split_champion.forEach(element_champ => {
                split_user.forEach(element_user => {

                    const laneCombination = `${element_champ}-${element_user}`;

                    if (laneCombination in lane_Scores) {
                        divider++
                        score += lane_Scores[laneCombination]

                    }
                })
            }

            )
            if (score != 0) { score = score / divider }
            return score
        }

    }

    function compare_class(champion_class, user_class) {

        class_synergy = {
            'bruiser-bruiser': 0.8,
            'bruiser-control mage': 0.6,
            'bruiser-assassin': 0.4,
            'bruiser-tank': 0.9,
            'bruiser-burst mage': 0.5,
            'bruiser-marksman': 0.3,
            'bruiser-utility mage': 0.7,
            'bruiser-dps mage': 0.5,
            'bruiser-tank/mage': 0.9,
            'bruiser-duelist': 0.9,
            'bruiser-support': 0.6,
            'bruiser-enchanter': 0.7,
            'bruiser-tank/bruiser': 0.9,
            'bruiser-fighter': 0.9,
            'control mage-bruiser': 0.6,
            'control mage-control mage': 0.8,
            'control mage-assassin': 0.4,
            'control mage-tank': 0.7,
            'control mage-burst mage': 0.8,
            'control mage-marksman': 0.4,
            'control mage-utility mage': 0.9,
            'control mage-dps mage': 0.8,
            'control mage-tank/mage': 0.8,
            'control mage-duelist': 0.6,
            'control mage-support': 0.9,
            'control mage-enchanter': 0.9,
            'control mage-tank/bruiser': 0.7,
            'control mage-fighter': 0.6,
            'assassin-bruiser': 0.4,
            'assassin-control mage': 0.4,
            'assassin-assassin': 0.8,
            'assassin-tank': 0.5,
            'assassin-burst mage': 0.7,
            'assassin-marksman': 0.2,
            'assassin-utility mage': 0.5,
            'assassin-dps mage': 0.7,
            'assassin-tank/mage': 0.5,
            'assassin-duelist': 0.9,
            'assassin-support': 0.4,
            'assassin-enchanter': 0.4,
            'assassin-tank/bruiser': 0.5,
            'assassin-fighter': 0.9,
            'tank-bruiser': 0.9,
            'tank-control mage': 0.7,
            'tank-assassin': 0.5,
            'tank-tank': 0.9,
            'tank-burst mage': 0.6,
            'tank-marksman': 0.4,
            'tank-utility mage': 0.8,
            'tank-dps mage': 0.7,
            'tank-tank/mage': 0.9,
            'tank-duelist': 0.9,
            'tank-support': 0.8,
            'tank-enchanter': 0.9,
            'tank-tank/bruiser': 0.9,
            'tank-fighter': 0.9,
            'burst mage-bruiser': 0.5,
            'burst mage-control mage': 0.8,
            'burst mage-assassin': 0.7,
            'burst mage-tank': 0.6,
            'burst mage-burst mage': 0.9,
            'burst mage-marksman': 0.3,
            'burst mage-utility mage': 0.8,
            'burst mage-dps mage': 0.9,
            'burst mage-tank/mage': 0.8,
            'burst mage-duelist': 0.7,
            'burst mage-support': 0.7,
            'burst mage-enchanter': 0.9,
            'burst mage-tank/bruiser': 0.6,
            'burst mage-fighter': 0.7,
            'marksman-bruiser': 0.3,
            'marksman-control mage': 0.4,
            'marksman-assassin': 0.2,
            'marksman-tank': 0.4,
            'marksman-burst mage': 0.3,
            'marksman-marksman': 0.9,
            'marksman-utility mage': 0.4,
            'marksman-dps mage': 0.6,
            'marksman-tank/mage': 0.4,
            'marksman-duelist': 0.2,
            'marksman-support': 0.9,
            'marksman-enchanter': 0.9,
            'marksman-tank/bruiser': 0.4,
            'marksman-fighter': 0.7,
            'utility mage-bruiser': 0.7,
            'utility mage-control mage': 0.9,
            'utility mage-assassin': 0.5,
            'utility mage-tank': 0.8,
            'utility mage-burst mage': 0.8,
            'utility mage-marksman': 0.4,
            'utility mage-utility mage': 0.9,
            'utility mage-dps mage': 0.8,
            'utility mage-tank/mage': 0.8,
            'utility mage-duelist': 0.7,
            'utility mage-support': 0.9,
            'utility mage-enchanter': 0.9,
            'utility mage-tank/bruiser': 0.8,
            'utility mage-fighter': 0.7,
            'dps mage-bruiser': 0.5,
            'dps mage-control mage': 0.8,
            'dps mage-assassin': 0.7,
            'dps mage-tank': 0.7,
            'dps mage-burst mage': 0.9,
            'dps mage-marksman': 0.6,
            'dps mage-utility mage': 0.8,
            'dps mage-dps mage': 0.9,
            'dps mage-tank/mage': 0.8,
            'dps mage-duelist': 0.7,
            'dps mage-support': 0.6,
            'dps mage-enchanter': 0.8,
            'dps mage-tank/bruiser': 0.7,
            'dps mage-fighter': 0.8,
            'tank/mage-bruiser': 0.9,
            'tank/mage-control mage': 0.8,
            'tank/mage-assassin': 0.5,
            'tank/mage-tank': 0.9,
            'tank/mage-burst mage': 0.8,
            'tank/mage-marksman': 0.4,
            'tank/mage-utility mage': 0.8,
            'tank/mage-dps mage': 0.8,
            'tank/mage-tank/mage': 0.9,
            'tank/mage-duelist': 0.8,
            'tank/mage-support': 0.9,
            'tank/mage-enchanter': 0.9,
            'tank/mage-tank/bruiser': 0.9,
            'tank/mage-fighter': 0.9,
            'duelist-bruiser': 0.9,
            'duelist-control mage': 0.6,
            'duelist-assassin': 0.9,
            'duelist-tank': 0.9,
            'duelist-burst mage': 0.7,
            'duelist-marksman': 0.2,
            'duelist-utility mage': 0.7,
            'duelist-dps mage': 0.7,
            'duelist-tank/mage': 0.8,
            'duelist-duelist': 0.9,
            'duelist-support': 0.5,
            'duelist-enchanter': 0.5,
            'duelist-tank/bruiser': 0.9,
            'duelist-fighter': 0.9,
            'support-bruiser': 0.6,
            'support-control mage': 0.9,
            'support-assassin': 0.4,
            'support-tank': 0.8,
            'support-burst mage': 0.7,
            'support-marksman': 0.9,
            'support-utility mage': 0.9,
            'support-dps mage': 0.6,
            'support-tank/mage': 0.9,
            'support-duelist': 0.5,
            'support-support': 1.0,
            'support-enchanter': 0.9,
            'support-tank/bruiser': 0.8,
            'support-fighter': 0.7,
            'enchanter-bruiser': 0.7,
            'enchanter-control mage': 0.9,
            'enchanter-assassin': 0.4,
            'enchanter-tank': 0.9,
            'enchanter-burst mage': 0.9,
            'enchanter-marksman': 0.9,
            'enchanter-utility mage': 0.9,
            'enchanter-dps mage': 0.8,
            'enchanter-tank/mage': 0.9,
            'enchanter-duelist': 0.5,
            'enchanter-support': 0.9,
            'enchanter-enchanter': 0.9,
            'enchanter-tank/bruiser': 0.8,
            'enchanter-fighter': 0.7,
            'tank/bruiser-bruiser': 0.9,
            'tank/bruiser-control mage': 0.7,
            'tank/bruiser-assassin': 0.5,
            'tank/bruiser-tank': 0.9,
            'tank/bruiser-burst mage': 0.6,
            'tank/bruiser-marksman': 0.4,
            'tank/bruiser-utility mage': 0.8,
            'tank/bruiser-dps mage': 0.7,
            'tank/bruiser-tank/mage': 0.9,
            'tank/bruiser-duelist': 0.9,
            'tank/bruiser-support': 0.8,
            'tank/bruiser-enchanter': 0.8,
            'tank/bruiser-tank/bruiser': 0.9,
            'tank/bruiser-fighter': 0.9,
            'fighter-bruiser': 0.9,
            'fighter-control mage': 0.6,
            'fighter-assassin': 0.9,
            'fighter-tank': 0.9,
            'fighter-burst mage': 0.7,
            'fighter-marksman': 0.7,
            'fighter-utility mage': 0.7,
            'fighter-dps mage': 0.8,
            'fighter-tank/mage': 0.9,
            'fighter-duelist': 0.9,
            'fighter-support': 0.7,
            'fighter-enchanter': 0.7,
            'fighter-tank/bruiser': 0.9,
            'fighter-fighter': 0.9,
        }


        const classCombination = `${champion_class}-${user_class}`;

        if (classCombination in class_synergy) {
            return class_synergy[classCombination];
        }

        return 0;

    }

    function compare_damagetype(champion_dmgtype, user_dmgtype) {
        const dmgtype_Scores = {
            'AD-AD': 0.5,
            'AD-AP': 1,
            'AP-AD': 1,
            'AP-AP': 0.5,
            'AD + AP-AD': 1,
            'AD + AP-AP': 1
        };

        const dmgCombination = `${champion_dmgtype}-${user_dmgtype}`;

        if (dmgCombination in dmgtype_Scores) {
            return dmgtype_Scores[dmgCombination];
        }

        return 0;

    }

    function compare_speciallty(champion_ability, user_ability) {
        var score = 0
        const abilityScores = {
            'mobile': 0.9,
            'CC': 0.7,
            'utility': 0.6,
            'burst': 0.8,
            'sustain': 0.5,
            'crowd control': 0.7,
            'engage': 0.6,
            'zone control': 0.5,
            'roaming': 0.6,
            'high dps': 0.8,
            'AoE damage': 0.6,
            'long-range': 0.5,
            'poke': 0.7,
            'melee': 0.6,
            'stealth': 0.7,
            'healing': 0.7,
            'protection': 0.7,
            'global presence': 0.6,
            'scaling': 0.5,
            'mobility': 0.8,
            'utility+burst': 0.9,
            'utility+sustain': 0.9,
            'utility+CC': 0.9,
            'engage+burst': 0.9,
            'engage+sustain': 0.9,
            'engage+CC': 0.9,
            'crowd control+burst': 0.9,
            'crowd control+sustain': 0.9,
            'crowd control+utility': 0.9,
            'mobile+CC': 0.9,
            'mobile+utility': 0.7,
            'mobile+burst': 0.9,
            'mobile+sustain': 0.9,
            'mobile+engage': 0.7,
            'mobile+crowd control': 0.7,
            'mobile+utility+burst': 0.9,
            'mobile+utility+sustain': 0.9,
            'mobile+utility+CC': 0.9,
            'engage+mobile': 0.7,
            'engage+mobile+CC': 0.9,
            'engage+mobile+utility': 0.7,
            'crowd control+mobile': 0.7,
            'crowd control+mobile+CC': 0.9,
            'crowd control+mobile+utility': 0.7
        }

        if (champion_ability in abilityScores) {
            score += abilityScores[champion_ability];
        }
        if (user_ability in abilityScores) {
            score += abilityScores[user_ability];
        }
        if (score != 0) {
            return score / 2
        } else return 0

    }

    // Other Matching Functions for Lol
    function matchRankLol(matchRank, matchRankLooking, userRank, userRankLooking) {
        // const rankScore = {
        //     'Unranked': 1,
        //     'Iron': 2,
        //     'Bronze': 3,
        //     'Silver': 4,
        //     'Gold': 5,
        //     'Platinum': 6,
        //     'Diamond': 7,
        //     'Master': 8,
        //     'Grandmaster': 9,
        //     'Challenger': 10,
        // }
        // if (user_rank === "Any") {
        //     return 50
        // }

        // if (match_rank in rankScore && user_rank in rankScore) {
        //     const score1 = rankScore[match_rank];
        //     const score2 = rankScore[user_rank];
        //     var score = 0

        //     if (score1 >= score2) {
        //         score = Math.abs(score1 - score2) * 5;
        //     } else if (score1 < score2) {
        //         score = Math.abs(score1 - score2) * 5;
        //     }

        //     return 50 - score
        // }

        var tmpScore = 0
        if (matchRank === userRankLooking) {
            tmpScore += 50
        }

        if (matchRankLooking === userRank) {
            tmpScore += 50
        }


        return tmpScore

    }

    function matchAge(match_age, user_age) {


        const minAge = user_age / 2 + 7
        const maxAge = (user_age - 7) * 2

        var score = 0

        if (match_age > minAge) {
            score += 20;
        }

        if (match_age < maxAge) {
            score += 20;
        }


        return score;
    }

    function matchGame(profile_game, user_game) {

        if (profile_game === user_game) {
            return profile_game
        }

        return ""

    }

    // Matching functions Valorant 
    function matchRankValo(match_rank, user_rank) {
        const rankScore = {
            'Iron': 1,
            'Bronze': 2,
            'Silver': 3,
            'Gold': 4,
            'Platinum': 5,
            'Diamond': 6,
            'Ascendant': 7,
            'Immortal': 8,
            'Radiant': 9,
        }
        if (match_rank in rankScore && user_rank in rankScore) {
            const score1 = rankScore[match_rank];
            const score2 = rankScore[user_rank];
            var score = 0
            if (score1 > score2) {
                score = score1 - score2
            } else if (score1 < score2) {
                score = score2 - score1
            }
            if (score <= 1) {
                return 20
            } else { return 0 }
        }


    }

    //Valorant Champion Matching (not in use currently. Probably redundant)
    function championValorant(
        userMain1,
        userMain2,
        userMain3,
        userLookingMain1,
        userLookingMain2,
        userLookingMain3,
        matchMain1,
        matchMain2,
        matchMain3,
        matchLookingMain1,
        matchLookingMain2,
        matchLookingMain3,
    ) {

        const championsInUse = [0, 1, 2, 3, 4, 5];
        const lookingForChamps = [0, 1, 2, 3, 4, 5];

        for (let i = 0; i < champion_valo.length; i++) {
            const Champion = champion_valo[i];

            if (Champion.name === userMain1) {
                championsInUse[0] = Champion;
            } if (Champion.name === userMain2) {
                championsInUse[1] = Champion;
            } if (Champion.name === userMain3) {
                championsInUse[2] = Champion;
            } if (Champion.name === matchMain1) {
                championsInUse[3] = Champion;
            } if (Champion.name === matchMain2) {
                championsInUse[4] = Champion;
            } if (Champion.name === matchMain3) {
                championsInUse[5] = Champion;
            } if (Champion.name === userLookingMain1) {
                lookingForChamps[0] = Champion
            } if (Champion.name === userLookingMain2) {
                lookingForChamps[1] = Champion
            } if (Champion.name === userLookingMain3) {
                lookingForChamps[2] = Champion
            } if (Champion.name === matchLookingMain1) {
                lookingForChamps[3] = Champion
            } if (Champion.name === matchLookingMain2) {
                lookingForChamps[4] = Champion
            } if (Champion.name === matchLookingMain3) {
                lookingForChamps[5] = Champion
            }
        }

        const user_champions = championsInUse.slice(0, 3); // Select the first three champions
        const comparison_champions = championsInUse.slice(3); // Select the second three champions
        const user_lookingFor = lookingForChamps.slice(0, 3);// Select the first three champions
        const match_lookingFor = lookingForChamps.slice(3);// Select the second three champions

        let score = 0;


        for (let i = 0; i < comparison_champions.length; i++) {
            const champion = comparison_champions[i];
            for (let j = 0; j < user_champions.length; j++) {
                const user_champion = user_champions[j]
                score += calculateAgentSynergy(champion, user_champion)
            }
        }

        for (let i = 0; i < user_lookingFor.length; i++) {
            const champion_user = user_lookingFor[i]
            for (let j = 0; j < comparison_champions.length; j++) {
                const champion_match = comparison_champions[j]

                if (champion_user.name === champion_match.name) {
                    score += 20
                }
            }
        }

        for (let i = 0; i < match_lookingFor.length; i++) {
            const champion_user = match_lookingFor[i]
            for (let j = 0; j < user_champions.length; j++) {
                const champion_match = user_champions[j]
                if (champion_user.name === champion_match.name) {
                    score += 20
                }
            }
        }


        // Function to calculate synergy score between two agents
        function calculateAgentSynergy(champion, user_champion) {
            // Role compatibility score
            const roleScore = calculateRoleCompatibility(champion.champion_class, user_champion.champion_class);

            // Calculate overall synergy score
            const synergyScore = roleScore
            return synergyScore;
        }

        // Function to calculate role compatibility score
        function calculateRoleCompatibility(role1, role2) {
            // Assign weights to role compatibility scores based on importance
            const roleWeights = {
                Duelist: 1,
                Controller: 0.8,
                Sentinel: 0.6,
                Initiator: 0.7,
            };

            // Check if roles are the same
            if (role1 === role2) {
                return roleWeights[role1];
            }

            // Return lower weight for different roles
            return Math.min((roleWeights[role1], roleWeights[role2]) * 10);
        }


        return score
    }

    //General Matching functions
    const matchServer = (profile_server, user_profile_server) => {
        var score = 0
        //Match Server
        if (profile_server !== user_profile_server) {
            score -= 500
        }
        return score
    }

    const matchKindOfGamer = (user_profile_gamerkind, user_profile_lookingGamerkind, profile_gamerkind, profile_lookingGamerkind) => {
        //Match kind of gamer
        var score = 0
        if (user_profile_lookingGamerkind === "Competition and Chill") {
            score += 40
        } else if (user_profile_lookingGamerkind === profile_gamerkind) {
            score += 40
        } else if (profile_gamerkind === "Competition and Chill") {
            score += 40
        }

        if (profile_lookingGamerkind === "Competition and Chill") {
            score += 40
        } else if (user_profile_lookingGamerkind === profile_gamerkind) {
            score += 40
        } else if (user_profile_gamerkind === "Competition and Chill") {
            score += 40
        }
        return score
    }


    const matchRole = (profile_role, profile_lookingRole, user_profile_role, user_profile_lookingRole) => {
        //Same role gives negative points and if role fits the looking for role it gives points
        var score = 0
        if (profile_role === user_profile_role) {
            score += -70
        }
        if (profile_role === user_profile_lookingRole || profile_role === "Fill") {
            score += 70
        }
        if (profile_lookingRole === user_profile_role || user_profile_role === "Fill") {
            score += 70
        }
        return score
    }

    const matchGender = (profile_gender, profile_lookingGender, user_profile_gender, user_profile_lookingGender) => {
        //Sort by the gender they selected
        var score = 0
        if (profile_gender === user_profile_lookingGender) {
            score += 60
        } else if (user_profile_lookingGender === "All") {
            score += 40
        } else {
            score -= 40
        }
        if (profile_lookingGender === user_profile_gender) {
            score += 60
        } else if (profile_lookingGender === "All") {
            score += 40
        } else {
            score -= 40
        }
        return score
    }


    //All Matching
    function match_profiles(profile_list, user_profile) {
        for (let i = 0; i < profile_list.length; i++) {
            const profile = profile_list[i];
            var finalScore = 0
            // Match games
            const game = matchGame(profile.game, user_profile.game)
            switch (game) {
                case "League of Legends":
                    finalScore += champion_match_new(
                        user_profile.mainLol1,
                        user_profile.mainLol2,
                        user_profile.mainLol3,
                        user_profile.lookingMainLol1,
                        user_profile.lookingMainLol2,
                        user_profile.lookingMainLol3,
                        profile.mainLol1,
                        profile.mainLol2,
                        profile.mainLol3,
                        profile.lookingMainLol1,
                        profile.lookingMainLol2,
                        profile.lookingMainLol3,
                    );

                    //Matching for rank
                    finalScore += matchRankLol(profile.rankLol, user_profile.rankLol)

                    //----------------------------------------------
                    // General Matching functions now
                    //----------------------------------------------
                    finalScore += matchServer(profile.server, user_profile.server)
                    finalScore += matchKindOfGamer(user_profile.gamerkind, user_profile.lookingGamerkind, profile.gamerkind, profile.lookingGamerkind)
                    finalScore += matchRole(profile.roleLol, profile.lookingRoleLol, user_profile.roleLol, user_profile.lookingRoleLol)
                    finalScore += matchGender(profile.gender, profile.lookingGender, user_profile.gender, user_profile.lookingGender)
                    finalScore += matchAge(profile.age, user_profile.age)
                    break;

                case "Valorant":
                    finalScore += champion_match_new(
                        user_profile.mainValo1,
                        user_profile.mainValo2,
                        user_profile.mainValo3,
                        user_profile.lookingMainValo1,
                        user_profile.lookingMainValo2,
                        user_profile.lookingMainValo3,
                        profile.mainValo1,
                        profile.mainValo2,
                        profile.mainValo3,
                        profile.lookingMainValo1,
                        profile.lookingMainValo2,
                        profile.lookingMainValo3,

                    );
                    //Matching for rank
                    finalScore += matchRankValo(profile.rankValo, user_profile.rankValo)

                    //----------------------------------------------
                    // General Matching functions now
                    //----------------------------------------------
                    finalScore += matchServer(profile.server, user_profile.server)
                    finalScore += matchKindOfGamer(user_profile.gamerkind, user_profile.lookingGamerkind, profile.gamerkind, profile.lookingGamerkind)
                    finalScore += matchRole(profile.roleValo, profile.lookingRoleValo, user_profile.roleValo, user_profile.lookingRoleValo)
                    finalScore += matchGender(profile.gender, profile.lookingGender, user_profile.gender, user_profile.lookingGender)
                    finalScore += matchAge(profile.age, user_profile.age)

                    break
                case "":
                    profile.score = -5000
                    continue
            }
            profile.score = finalScore
        }
        // console.log("Profiles : ", profile_list.sort((a, b) => b.score - a.score))
        return profile_list.sort((a, b) => b.score - a.score);
    }

    //function to send data to php

    function sendDataToPHP(dataToSend) {
        // Stringify the array of objects
        const jsonData = JSON.stringify(dataToSend);

        // Create a new fetch request
        fetch('https://ur-sg.com/algoData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: "param=" + jsonData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response; // Parse response as JSON
            })
            .then(data => {
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    //Now everything should be prepared to run the algorythm
    if (championValo && championList) {

        const matched_profiles = match_profiles(profileList, userProfile).filter((obj) => {
            return userProfile.userid !== obj.userid;
        });

        sendDataToPHP(matched_profiles.map((obj) => {
            const dataToSend = ({
                user_id: userProfile.userid,
                user_matching: obj.userid,
                score: obj.score,
            })
            return dataToSend
        }))

    }
};

export default UseSwipeAlgorithm