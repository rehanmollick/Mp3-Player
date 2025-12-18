package com.interviewapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * MainActivity - Entry point for the React Native application.
 * Hosts the React Native root component and delegates rendering to the React Native framework.
 */
class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "InterviewApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
