import React from 'react'
import { Vibration, Alert } from 'react-native'
import RNSecureStorage from 'rn-secure-storage'
import { NavigationSwitchProp } from 'react-navigation'
import { PASSCODE_KEY } from '@constants/async-storage'
import { PasscodeKeyboard } from '@components/passcode/passcode-keyboard'
import { AUTH_LOADING_SCREEN } from '@constants/screens'
import { signOut } from '@services/sign-out'

const initialState = Object.freeze({
  attemptCount: 0,
  shouldAnimateError: false,
})

type Props = {
  navigation: NavigationSwitchProp
  currentPasscode: string
  onPasscodeCorrect: () => void
}
type State = typeof initialState

class EnterPasscode extends React.PureComponent<Props, State> {
  readonly state = initialState

  handlePasscodeEntered = (passcode: number[]) => {
    const { currentPasscode } = this.props
    const isPasscodeCorrect = currentPasscode === passcode.map(Number).join('')
    if (isPasscodeCorrect) {
      this.props.navigation.navigate(AUTH_LOADING_SCREEN)
      return
    }

    Vibration.vibrate(0, false)
    this.setState(
      ({ attemptCount }) => ({
        attemptCount: attemptCount + 1,
        shouldAnimateError: true,
      }),
      async () => {
        if (this.state.attemptCount === 5) {
          try {
            await signOut()
            await RNSecureStorage.remove(PASSCODE_KEY)
            this.props.navigation.navigate(AUTH_LOADING_SCREEN)
          } catch (error) {
            Alert.alert('Error', 'An error occured.')
            this.setState({ shouldAnimateError: false })
            return
          }
        } else {
          this.setState({ shouldAnimateError: false })
        }
      }
    )
  }

  render() {
    return (
      <PasscodeKeyboard
        shouldAnimateError={this.state.shouldAnimateError}
        onPasscodeEntered={this.handlePasscodeEntered}
        message="Enter passcode"
      />
    )
  }
}

export { EnterPasscode }
