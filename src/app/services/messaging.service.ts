import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import AgoraRTM, { RtmChannel, RtmClient, RtmMessage } from 'agora-rtm-sdk';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { StreamService } from './stream.service';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  rtmclient!: RtmClient;
  channel!: RtmChannel;
  rtmToken: any;
  _invitation = null;
  _token = undefined;
  //   _remoteInvitation = null
  getStatus = new BehaviorSubject(null);

  constructor(private router: Router, private streamService: StreamService, private toastr: ToastrService) { }

  // appId
  createRTMClient() {
    this.rtmclient = AgoraRTM.createInstance(
      '65cfadb6ee9d42f4977b6eafb18b3d71'
    );
    return this.rtmclient;
  }

  signalLogin(uid) {
    return this.rtmclient
      .login({
        token: this._token,
        uid: uid,
      })
      .then(() => {
        console.log('status online');
      });
  }

  async SignalLogout(client: RtmClient) {
    await client.logout();
  }

  inquire(peerIds) {
    return this.rtmclient.queryPeersOnlineStatus(peerIds);
  }

  getRoomCode = (c1, c2) => {
    let roomCode = '';
    roomCode = c1 + c2;
    return roomCode;
  };

  RTMevents(client: RtmClient) {
    client.on('ConnectionStateChanged', (newState, reason) => {
      console.log(
        'on connection state changed to' + newState + 'reason: ' + reason
      );
    });
    client.on('MessageFromPeer', (text, peerId) => {
      this.receivedMessage(text, peerId);
    });

    client.on('PeersOnlineStatusChanged', (status) => {
      console.log('PeersOnlineStatusChanged', status);
    });
  }

  receivedMessage(text: RtmMessage, peerId: string) {
    console.log(text, peerId, 'MessageFromPeer');
    if (text.messageType === 'TEXT') {
      this.setCurrentMessage({ message: text.text, user: peerId });
    }
  }

  receiveChannelMessage(channel: RtmChannel, client: RtmClient) {
    channel.on('ChannelMessage', (text, senderId, messagePros) => {
      this.handleMessageReceived(text, senderId, messagePros, client);
    });
    channel.on('MemberJoined', (memberId) => {
      console.log(memberId, 'MemberJoined');
    });
    channel.on('MemberLeft', (memberId) => {
      console.log('MemberLeft', memberId);
    });
  }

  async handleMessageReceived(
    text: RtmMessage,
    senderId: string,
    messagePros,
    client: RtmClient
  ) {
    const user = await client.getUserAttributes(senderId);
    console.log(text, senderId, messagePros, user, 'channelmsg');
    if (text.messageType === 'TEXT') {
      const newMessageData = { user, message: text.text };
      this.setCurrentMessage(newMessageData);
    }
  }

  setCurrentMessage(newMessageData) {
    console.log(newMessageData, 'setCuurentMessage');
    alert(newMessageData.message);
  }

  localInvitation(calleeId, channel) {

    //Create a local invitation
    this._invitation = this.rtmclient.createLocalInvitation(calleeId);

    //Local monitoring and inviting peers
    this._invitation.on('LocalInvitationReceivedByPeer', () => {
      console.log('Peers receive calls');
    });

    //Cancel call invitation
    this._invitation.on('LocalInvitationCanceled', () => {
      console.log('Cancel call invitation');
    });

    //Called accepted call invitation
    this._invitation.on('LocalInvitationAccepted', () => {
      console.log('Peers accept invitations to call');
      this.getStatus.next(true);
      this.streamService.join(channel);
    });

    //Called down
    this._invitation.on('LocalInvitationRefused', () => {
      console.log('Peers refuse to call invitations');
      this.toastr.error('Peer refused to call invitations', '', {
        timeOut: 3000,
      });
      this.getStatus.next(false);
      this.router.navigate(['/user']);
    });

    //Local call failed
    this._invitation.on('LocalInvitationFailure', () => {
      console.log('Call process failed');
      this.getStatus.next(false);
    });

    this._invitation.content = channel;

    //Send call invitation locally
    this._invitation.send();
  }

  createRtmChannel(client: RtmClient) {
    const channel = client.createChannel('test');
    return channel;
  }

  async joinChannel(channel: RtmChannel) {
    await channel.join();
  }

  async setLocalAttributes(client: RtmClient, name: string) {
    await client.setLocalUserAttributes({
      name,
    });
  }

  sendMessageChannel(channel: RtmChannel) {
    channel.sendMessage({ text: 'test channel message' }).then(() => {
      console.log('test');
    });
  }

  async leaveChannel(client: RtmClient, channel: RtmChannel) {
    if (channel) {
      await channel.leave();
    }
    if (client) {
      await client.logout();
    }
  }

  sentOneToOneMessage(client: RtmClient, uid) {
    client
      .sendMessageToPeer({ text: 'test peer message' }, uid)
      .then((sendResult) => {
        if (sendResult.hasPeerReceived) {
          console.log(sendResult, 'sendMessageToPeer');
        }
      });
  }
}
