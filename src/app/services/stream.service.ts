import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { SdkComponent } from '../sdk/sdk.component';

@Injectable({
  providedIn: 'root',
})
export class StreamService {

  playerContainer: any;

  media: any;
  rtc = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
  };

  options = {
    appId: '65cfadb6ee9d42f4977b6eafb18b3d71',
    channel: 'test',
  };
  remoteUsers = [];
  updateUserInfo = new BehaviorSubject(null);
  getMediaStatus = new BehaviorSubject(null);


  constructor(private router: Router, private toastr: ToastrService) { }

  createRTCClient() {
    this.rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
  }

  agoraServerEvents() {
    this.rtc.client.on('user-published', async (user, mediaType) => {
      // Subscribe to a remote user.
      await this.rtc.client.subscribe(user, mediaType);
      this.media = mediaType;
      console.log('subscribe success');
      this.getMediaStatus.next(true);
      // If the subscribed track is video.
      if (mediaType === 'video') {
        // Get `RemoteVideoTrack` in the `user` object.
        const remoteVideoTrack = user.videoTrack;
        // // Dynamically create a container in the form of a DIV element for playing the remote video track.
        this.playerContainer = document.getElementById('remote-player');
        // Specify the ID of the DIV container. You can use the `uid` of the remote user.
        this.playerContainer.id = user.uid.toString();
        this.playerContainer.style.margin = '25px';
        document.body.append(this.playerContainer);
        console.log(this.playerContainer);

        // Play the remote video track.
        // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
        remoteVideoTrack.play(this.playerContainer);

        this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        this.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: '720p',
        });
        this.rtc.localVideoTrack.play('local-player');
        await this.rtc.client.publish([
          this.rtc.localAudioTrack,
          this.rtc.localVideoTrack,
        ]);
      }

      // If the subscribed track is audio.
      if (mediaType === 'audio') {
        // Get `RemoteAudioTrack` in the `user` object.
        const remoteAudioTrack = user.audioTrack;
        // Play the audio track. No need to pass any DOM element.
        remoteAudioTrack.play();

        this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await this.rtc.client.publish([this.rtc.localAudioTrack]);
      }
    });

    this.rtc.client.on('user-unpublished', (user: any) => {
      console.log(user, 'user-unpublished');
    });

    this.rtc.client.on(
      'connection-state-change',
      (curState: any, PrevState: any) => {
        console.log('current', curState, 'prev', PrevState, 'event');
      }
    );

    this.rtc.client.on('user-Joined', (user) => {
      let id = user.id;
      this.remoteUsers.push({ uid: +id });
      this.updateUserInfo.next(id);
      console.log('user-Joined', user, this.remoteUsers, 'event1');
    });

    this.rtc.client.on('channel-media-relay-event', (user) => {
      console.log('channel-media-relay-event', user, 'event2');
    });

    this.rtc.client.on('user-left', (user) => {
      console.log('user-left', user, 'event3');
      this.toastr.error('user-left', '', {
        timeOut: 3000,
      });
      this.leaveCall();
    });

    this.rtc.client.on('channel-media-relay-state', (user) => {
      console.log('channel-media-relay-state', user, 'event4');
    });

    this.rtc.client.on('crypt-error', (user) => {
      console.log('crypt-error', user, 'event5');
    });

    this.rtc.client.on('exception', (user) => {
      console.log('exception', user, 'event6');
    });

    this.rtc.client.on('live-streamig-error', (user) => {
      console.log('live-streamig-error', user, 'event7');
    });

    this.rtc.client.on('live-streamig-warning', (user) => {
      console.log('live-streamig-warning', user, 'event8');
    });

    this.rtc.client.on('exception', (user) => {
      console.log('exception', user, 'event9');
    });

    this.rtc.client.on('media-reconnect-end', (user) => {
      console.log('media-reconnect-end', user, 'event10');
    });

    this.rtc.client.on('network-quality', (user) => { });

    this.rtc.client.on('stream-fallback', (user) => {
      console.log('stream-fallback', user, 'event12');
    });

    this.rtc.client.on('stream-type-changed', (user) => {
      console.log('stream-type-changed', user, 'event13');
    });

    this.rtc.client.on('token-privilage-did-expire', (user) => {
      console.log('token-privilage-did-expire', user, 'event14');
    });

    this.rtc.client.on('token-privilage-will-expire', (user) => {
      console.log('token-privilage-will-expire', user, 'event15');
    });

    this.rtc.client.on('volume-indicator', (user) => {
      console.log('volume-indicator', user, 'event16');
    });

    this.rtc.client.on('trace-ended', (user) => {
      console.log('trace-ended', user, 'event17');
    });
  }

  async leaveCall() {
    if (this.media == 'audio') {
      if (this.rtc && this.rtc.localAudioTrack) {
        this.playerContainer.remove();
        this.rtc.localAudioTrack.close();
        // await this.rtc.client.leave();
        await this.rtc.client.leave(
          function () {
            console.log('Leave channel successfully');
          },
          function (err) {
            console.log('Leave channel failed');
          }
        );
      }


    }

    if (this.media == 'video') {
      if (this.rtc && this.rtc.localAudioTrack && this.rtc.localVideoTrack) {
        console.log("history");
        this.rtc.localAudioTrack.close();
        this.rtc.localVideoTrack.close();
        this.playerContainer.remove();
        await this.rtc.client.leave(
          function () {
            console.log('Leave channel successfully');
          },
          function (err) {
            console.log('Leave channel failed');
          }
        );
      }
    }
    this.media = '';
    this.getMediaStatus.next(false);
    this.router.navigate(['/user']);
  }


  handleEvents() {
    this.rtc.client.on('error', (err) => {
      console.log(err);
    });
    // Occurs when the peer user leaves the channel; for example, the peer user calls Client.leave.
    this.rtc.client.on('peer-leave', (evt) => {
      var id = evt.uid;
      console.log('peer-leave', id);
    });
    // Occurs when the local stream is _published.
    this.rtc.client.on('stream-published', (evt) => {
      console.log('stream-published');
    });
    // Occurs when the remote stream is added.
    this.rtc.client.on('stream-added', (evt) => {
      var remoteStream = evt.stream;
      var id = remoteStream.getId();
      console.log('remoteStream', id);
      console.log('stream-added remote-uid: ');
    });
    // Occurs when a user subscribes to a remote stream.
    this.rtc.client.on('stream-subscribed', (evt) => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStream.play('remote_video_' + id, { fit: 'cover' });
      console.log('stream-subscribed remote-uid: ', id);
    });
    // Occurs when the remote stream is removed; for example, a peer user calls Client.unpublish.
    this.rtc.client.on('stream-removed', (evt) => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStream.stop('remote_video_' + id);
      console.log('stream-removed remote-uid: ', id);
    });
    this.rtc.client.on('onTokenPrivilegeWillExpire', () => {
      // After requesting a new token
      console.log('onTokenPrivilegeWillExpire');
    });
    this.rtc.client.on('onTokenPrivilegeDidExpire', () => {
      // After requesting a new token
      console.log('onTokenPrivilegeDidExpire');
    });
    // Occurs when the live streaming starts.
    this.rtc.client.on('liveStreamingStarted', (evt) => {
      console.log('liveStreamingStarted', evt);
    });
    // Occurs when the live streaming fails.
    this.rtc.client.on('liveStreamingFailed', (evt) => {
      console.log('liveStreamingFailed', evt);
    });
    // Occurs when the live streaming stops.
    this.rtc.client.on('liveStreamingStopped', (evt) => {
      console.log('liveStreamingStopped', evt);
    });
    // Occurs when the live transcoding setting is updated.
    this.rtc.client.on('liveTranscodingUpdated', (evt) => {
      console.log('liveTranscodingUpdated', evt);
    });
  }

  async join(channel) {
    this.createRTCClient();
    const uid = await this.rtc.client.join(
      this.options.appId,
      channel,
      null,
      1234
    );
    this.agoraServerEvents();
  }
}
