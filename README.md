# warning - use at your own risk :-)

This demonstration app is the result of a prototype effort, and does not reflect Bandwidth release standards. Use at your own risk, and expect bugs.

# The configurable "courtroom" demo

This sample app takes a specialized scenario of a 'courtroom' environment that has 3 types of participants: the Judge, the Translator, and the Limited English Participant in the 'trial'. There are also multiple configurations for the virtual courtroom: each configuration has a different set of rule that govern which type of participant can hear (and thus speak to) the other types of participant. The Judge is the one that controls the configuration of the virtual room.

Each participant is represented by a browser page that exposes the participant's role, and the communication sessions that they have established to other users.

<img src="./participant.jpg">

The page lists

- the Role that the web-page participant represents,
- the session that all participants belong to
- the participant's identity
- if the participant is a Judge, the configuration that the virtual room is in.
- a microphone that represents a local mute state - initially muted
- a field that allows the participant to add a phone-based participant
- a list of fields that represent the audio received from other participants.

## Running the app

This app is set up to run using multiple browser windows, each of which represents a chosen role in the courtroom.

To run the app open multiple tabs and browse to the localhost address and port.  When each tab is opened the only thing that the user can do is choose a role.  Based on that role, and the roles chosen on other tabs, as well as the state of the room, each tab will have one or more streams activated, and represented in the list of streams on that tab.  Each stream also has an audio intensity meter under the stream id.  That intensity meter will indicated when audio is being received on the indicated stream.

All of the tabs also have a mute button that will control whether that tab will actually send media.  All tabs start in the muted state.

So for example, suppose that the room-state rules indicate that all roles receive all streams.  If one of the tabs is un-muted, when the mic receives audio, all of the other tabs should indicate some audio for the stream that is coming from the un-muted tab.

You can play with different combinations of room state (remember only the Judge role can change the room state), participant type, and mute button to demonstrate how the rules are being followed.

## Setting things up

To run this sample, you'll need a Bandwidth phone number, Voice API credentials and WebRTC enabled for your account. Please check with your account manager to ensure you are provisioned for WebRTC.

This sample will need be publicly accessible to the internet in order for Bandwidth API callbacks to work properly. Otherwise you'll need a tool like [ngrok](https://ngrok.com) to provide access from Bandwidth API callbacks to localhost. Once ngrok is loaded the correct tunnel is established with the command ngrok https 5000.

### Create a Bandwidth Voice API application

Follow the steps in [How to Create a Voice API Application](https://support.bandwidth.com/hc/en-us/articles/360035060934-How-to-Create-a-Voice-API-Application-V2-) to create your Voice API appliation.

- In step 7 and 8, make sure they are set to POST.

- In step 9, provide the publicly accessible URL of your sample app. You need to add `/incomingCall` to the end of this URL in the Voice Application settings.

- You do no need to set a callback user id or password.

- Create the application and make note of your _Application ID_. You will provide this in the settings below.

### Configure your sample app

Copy the default configuration files

```bash
cp .env.default .env
```

Add your Bandwidth account settings to `.env`:

- ACCOUNT_ID=
- BAND_USERNAME=
- BAND_PASSWORD=

Add your Voice API application information:

- VOICE_APPLICATION_ID
- BASE_CALLBACK_URL
- FROM_NUMBER
- OUTBOUND_PHONE_NUMBER

You can ignore the other settings in the `.env.default` file.

### Install dependencies and build

From the main directory...

```
bash
cd ./frontend
npm install
npm run build

cd ../
npm install
npm start
```

### Communicate!

Browse to [http://localhost:5000](http://localhost:5000) and grant permission to use your microphone. For the sample application to work properly you will need to open multiple browser windows, all of which are connected to [http://localhost:5000](http://localhost:5000).

You should now be able to execute the actions described above The web UI will indicate when you are connected. The format of the telephone number includes a +1 followed by 10 digits.

Enjoy!

## Room Configurations

The rules for each configuration of the room are hard-coded in the file roomstate.js

For each state of the room, there are rules about who can listen to (subscribe) to whom.  As the room states change from one to another, the subscriptions are re-written to reflect these hardcoded rules.  Feel free to change them and experiment.

The server will summarize the rules in the console at the beginning of each run, in a display that looks something like...
```
Room State Map of who can listen to whom...
state inPrep role judge  can listen to:  [ 'translator', 'LEP' ]
state inPrep role LEP  can listen to:  []
state inPrep role translator  can listen to:  [ 'judge' ]

state inSession role judge  can listen to:  [ 'translator', 'LEP' ]
state inSession role LEP  can listen to:  [ 'translator', 'judge' ]
state inSession role translator  can listen to:  [ 'LEP', 'judge' ]

state inTervention role judge  can listen to:  []
state inTervention role LEP  can listen to:  []
state inTervention role translator  can listen to:  []
```

# One Final Caution

There are TODOs in this code-base.  This is intended to be an internal demo/example app, and is not yet in a state for release to our customers.