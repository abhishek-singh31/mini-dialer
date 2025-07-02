import * as Twilio from 'twilio';
import { VoiceGrant } from 'twilio/lib/jwt/AccessToken';

export class DialerService {
  generateAccessToken = async () => {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioApiKey = process.env.TWILIO_API_KEY;
    const twilioApiSecret = process.env.TWILIO_API_SECRET;

    // Used specifically for creating Voice tokens
    const outgoingApplicationSid = process.env.TWILIO_APP_SID;
    const identity = process.env.TWILIO_CLIENT_IDENTITY;

    // Create a "grant" which enables a client to use Voice as a given user
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: outgoingApplicationSid,
      incomingAllow: true, // Optional: add to allow incoming calls
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const AccessToken = Twilio.jwt.AccessToken;
    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity },
    );
    token.addGrant(voiceGrant);

    // Serialize the token to a JWT string
    return {
      token: token.toJwt(),
    };
  };
}
