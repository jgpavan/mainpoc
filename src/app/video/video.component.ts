import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { MessagingService } from '../services/messaging.service';
import { StreamService } from '../services/stream.service';
@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit {
  userName = '';
  hideBtns = true;
  myId: any;
  roomCode: any;
  remoteId: any;
  callingStatus = false;
  constructor(
    public stream: StreamService,
    public api: ApiService,
    public message: MessagingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.stream.updateUserInfo.subscribe(async (id: any) => {
      if (id) {
        const user = await this.message.rtmclient.getUserAttributes(
          id.toString()
        );
        for (let index = 0; index < this.stream.remoteUsers.length; index++) {
          const element = this.stream.remoteUsers[index];
          if (element.uid == id) {
            element.name = user['name'];
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.remoteId = this.route.snapshot.paramMap.get('id');
    this.userName = this.route.snapshot.paramMap.get('username');
    console.log('routeid', this.remoteId)
    this.startCall();
    this.route.params.subscribe(value => {
      console.log("value ", value);
    });
    this.message.getStatus.subscribe(async (status: any) => {
      this.callingStatus = status;
    });

    this.stream.getMediaStatus.subscribe(async (status: any) => {
      this.callingStatus = status;
    });
    // window.history.pushState("object or string", "Title", "/VideoCalling");
  }

  async startCall() {
    this.myId = 1234;
    await this.generateTokenAndUid(this.myId);
    await this.rtmUserLogin(this.myId);
    this.hideBtns = false;
    this.callPeer();
  }

  async generateTokenAndUid(uid: string | number) {
    let url = 'https://test-agora.herokuapp.com/access_token?';
    const opts = {
      params: new HttpParams({ fromString: 'channel=test&uid=' + uid }),
    };
    const data = await this.api.getRequest(url, opts.params).toPromise();
    return { uid: uid, token: data['token'] };
  }

  async generateRtmTokenAndUid(uid: string) {
    let url = 'https://sharp-pouncing-grass.glitch.me/rtmToken?';
    const opts = { params: new HttpParams({ fromString: 'account=' + uid }) };
    const data = await this.api.getRequest(url, opts.params).toPromise();
    return { uid: uid, token: data['key'] };
  }

  generateUid() {
    const length = 4;
    const randonNo = Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
    );
    return randonNo;
  }

  async rtmUserLogin(uid: any) {
    this.message.rtmclient = this.message.createRTMClient();
    await this.message.signalLogin(uid.toString());
    this.message.RTMevents(this.message.rtmclient);
  }

  callPeer() {
    const code = this.remoteId;
    this.message
      .inquire([code])
      .then((res) => {
        if (res[code]) {
          console.log('peer', code, 'is online');
          this.roomCode = this.message.getRoomCode(this.myId, code);
          console.log('room', this.roomCode + 'Video');
          this.message.localInvitation(code, this.roomCode + 'Video' + '[Front Door]' + 'DoorID943');
        }
      })
      .catch(() => {
        console.log('The query failed');
      });
  }

  leaveCall() {
    this.stream.leaveCall();
  }
}
