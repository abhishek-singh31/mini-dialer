import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';
import { promisify } from 'util';

@Injectable()
export class CallingService {
  private readonly twilioClient: Twilio.Twilio;
  constructor() {
    this.twilioClient = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  handleOutboundCall = async (body: any) => {
    const { To: to } = body;
    const response = new Twilio.twiml.VoiceResponse();
    response.say('We are connecting you. Please wait');
    response.dial({ callerId: process.env.TWILIO_PHONE_NUMBER }).number(to);
    const twiml = response.toString();
    return twiml;
  };

  handleInboundCall = async () => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say('Welcome to mini dialer');
    response.pause({ length: 1 });
    response.dial().client(process.env.TWILIO_CLIENT_IDENTITY);
    const twiml = response.toString();
    return twiml;
  };

  handleHoldCall = async (body) => {
    const { callData, isCallOnHold, conferenceSid } = body;
    const childCall = await this.twilioClient.calls.list({
      parentCallSid: callData.CallSid,
    });
    const childCallSid = childCall[0].sid;
    if (conferenceSid) {
      isCallOnHold
        ? await this.unholdParticipant(childCallSid, conferenceSid)
        : await this.holdParticipant(childCallSid, conferenceSid);
      return { conferenceSid };
    } else {
      const conferenceName = `conference_${Date.now()}`;
      await this.moveToConference(childCallSid, conferenceName);
      await this.moveToConference(callData.CallSid, conferenceName);
      await this.sleep(1000); // because conference is not created immediately
      const conferences = await this.twilioClient.conferences.list({
        friendlyName: conferenceName,
      });
      const conferenceSid = conferences[0].sid;
      await this.holdParticipant(childCallSid, conferenceSid);
      return { conferenceSid };
    }
  };

  moveToConference = async (callSid: string, conferenceName: string) => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say('Joining the conference');
    response.dial().conference(conferenceName);
    const twiml = response.toString();
    await this.twilioClient.calls(callSid).update({ twiml });
  };

  holdParticipant = async (callSid: string, conferenceSid: string) => {
    await this.twilioClient
      .conferences(conferenceSid)
      .participants(callSid)
      .update({
        hold: true,
        holdUrl:
          'https://abhishek-mini-dialer.in.ngrok.io/v1/calling/hold-twiml',
      });
  };

  unholdParticipant = async (callSid: string, conferenceSid: string) => {
    await this.twilioClient
      .conferences(conferenceSid)
      .participants(callSid)
      .update({ hold: false });
  };

  handleTransferCall = async (body) => {
    const { callSid, callFrom } = body;
    const parentCallSid = (await this.twilioClient.calls(callSid).fetch())
      .parentCallSid;

    if (parentCallSid) {
      // inbound transfer
      const transferTwiml = this.getInboundCallTransferTwiml(callFrom);
      await this.twilioClient
        .calls(parentCallSid)
        .update({ twiml: transferTwiml });
    } else {
      // outbound transfer
      const calls = await this.twilioClient.calls.list({
        parentCallSid: callSid,
      });
      const transferTwiml = this.getOutboundCallTransferTwiml(callFrom);
      await this.twilioClient
        .calls(calls[0].sid)
        .update({ twiml: transferTwiml });
    }
    return true;
  };

  getInboundCallTransferTwiml = (callFrom: string) => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say(
      'Please wait while we are transferring your call to one of our agents',
    );
    response
      .dial({ callerId: callFrom })
      .number(process.env.INBOUND_TRANSFER_NUMBER);
    const twiml = response.toString();
    return twiml;
  };

  getOutboundCallTransferTwiml = (callFrom: string) => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say(
      'Please wait while we are transferring your call to one of our agents',
    );
    response
      .dial({ callerId: callFrom })
      .number(process.env.OUTBOUND_TRANSFER_NUMBER);
    const twiml = response.toString();
    return twiml;
  };

  getHoldTwiml = () => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say(
      "The person you're speaking with has put your call on hold. Please stay on the line.",
    );
    response.pause({ length: 2 });
    const twiml = response.toString();
    return twiml;
  };

  getResumeTwiml = (childCall) => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say('Resuming your call.');
    response.pause({ length: 1 });
    response
      .dial({ callerId: process.env.TWILIO_PHONE_NUMBER })
      .number(childCall.To);
    const twiml = response.toString();
    return twiml;
  };

  sleep = async (ms: number) => await promisify(setTimeout)(ms);
}
