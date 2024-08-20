import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from 'react'

const AuthLayout = () => {
  return (
    <>
        <Stack>
            <Stack.Screen 
              name="basic-info"
              option={{ headerShown: false }}
            />
            <Stack.Screen 
              name="league-data"
              option={{ headerShown: false }}
            />
            <Stack.Screen 
              name="lookingfor-data"
              option={{ headerShown: false }}
            />
            <Stack.Screen 
              name="update-profile"
              option={{ headerShown: false }}
            />
        </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  )
}

export default AuthLayout