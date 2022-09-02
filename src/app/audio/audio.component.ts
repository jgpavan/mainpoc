import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { MessagingService } from '../services/messaging.service';
import { StreamService } from '../services/stream.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit {
  userName = '';
  hideBtns = true;
  myId: any;
  id: any;
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
        ); //senderId
        // means uid getUserInfo
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
    this.id = this.route.snapshot.paramMap.get('id');
    this.userName = this.route.snapshot.paramMap.get('username');
    console.log('routeid', this.id)
    console.log('username', this.userName);
    this.startCall();
    this.route.params.subscribe(value => {
      console.log("value ", value);
    })

    this.message.getStatus.subscribe(async (status: any) => {
      this.callingStatus = status;
      console.log(this.callingStatus);
    });

    this.stream.getMediaStatus.subscribe(async (status: any) => {
      this.callingStatus = status;
    });
    // window.history.pushState("object or string", "Title", "/AudioCalling");
  }

  async startCall() {
    this.myId = 1234;
    await this.generateTokenAndUid(this.myId);
    await this.rtmUserLogin(this.myId);
    this.hideBtns = false;
    this.callPeer();
  }

  // rtc token

  async generateTokenAndUid(uid: string | number) {
    let url = 'https://test-agora.herokuapp.com/access_token?';
    const opts = {
      params: new HttpParams({ fromString: 'channel=test&uid=' + uid }),
    };
    const data = await this.api.getRequest(url, opts.params).toPromise();
    return { uid: uid, token: data['token'] };
    console.log(uid);
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
    const code = this.id;
    this.message
      .inquire([code])
      .then((res) => {
        if (res[code]) {
          console.log('peer', code, 'is online');
          let roomCode = this.message.getRoomCode(this.myId, code);
          console.log('room', roomCode + 'Audio');
          this.message.localInvitation(code, roomCode + 'Audio' + '[Front Door]' + 'DoorID943');
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
