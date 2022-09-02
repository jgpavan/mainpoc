import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { title } from 'process';
interface TenantList {
  TenantName: any;
  id: string;
  groupNumber: number;
  username: string;
}
@Component({
  selector: 'app-sdk',
  templateUrl: './sdk.component.html',
  styleUrls: ['./sdk.component.scss'],
})

export class SdkComponent implements OnInit {
  getUsers: TenantList[];
  userCopy: any = [];
  searchText;
  userName = '';
  roomCode: any;
  id: any;
  stamp: any;
  decryptedId: any;
  decryptedStamp: any;
  constructor(private db: AngularFireDatabase, private route: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    const locate = window.location.href;
    console.log(locate)

    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(this.id);

    this.decryptedId = atob(this.id);
    console.log(this.decryptedId)
    this.stamp = this.activatedRoute.snapshot.paramMap.get('stmp');
    console.log(this.stamp);
    this.decryptedStamp = atob(this.stamp);
    console.log(this.decryptedStamp);
    let ts = this.decryptedStamp;
    let unix_timestamp = ts;
    let date = new Date(unix_timestamp * 1000);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    console.log(formattedTime);
    if (this.decryptedId && this.id) {
      localStorage.setItem('id', this.decryptedId);
    }
    else {
      if (!this.id) {
        this.decryptedId = localStorage.getItem('id');
      }
    }
    this.db.list('TenantList').snapshotChanges().subscribe(data => {
      this.getUsers = [];
      data.forEach(item => {
        let a = item.payload.toJSON();
        a['id'] = item.key;
        this.getUsers.push(a as TenantList);
        this.userCopy.push(a as TenantList);
      });
      this.filterByID();
      // console.log(this.getUsers);
    });

    // this.route.navigate(['/url'], { queryParams: { page: this.id }, skipLocationChange: true })
  }

  // ngAfterContentInit() {
  //   window.history.pushState("object or string", title, "/QrCodeEntrySystem.com");
  // }


  filterByID() {
    // let decryptedURL = window.location.href;
    // const urlValue = decryptedURL.toString().replace(/\//g, '&');
    // const finalURL = new URLSearchParams(urlValue);
    // const id = finalURL.get('id');
    // const stamp = finalURL.get('stmp');
    // console.log(stamp);
    // let unix_timestamp = 17777;
    // var date = new Date(unix_timestamp * 1000);
    // var hours = date.getHours();
    // var minutes = "0" + date.getMinutes();
    // var seconds = "0" + date.getSeconds();
    // var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    // console.log(formattedTime);
    // console.log(id);
    if (localStorage.getItem('id')) {
      const localId = localStorage.getItem('id');
      console.log(localId, "local");
      const userCopy: any = this.getUsers.find((item => item.id === this.decryptedId));
      if (userCopy?.id && userCopy?.ListFBTenantIdModel) {
        if (typeof userCopy.ListFBTenantIdModel === "object") {
          userCopy.ListFBTenantIdModel = Object.values(userCopy.ListFBTenantIdModel);
        }
        this.userCopy = userCopy.ListFBTenantIdModel;
        const sortedArray = this.userCopy;
        sortedArray.sort((a: any, b: any) => a?.['TenantName'].localeCompare(b?.['TenantName']));
        console.log(sortedArray);
        this.getUsers = this.userCopy;
      }
    };
    // console.log(this.getUsers);
  }


  searchUser() {
    // console.log("serch ", this.searchText);
    if (!this.searchText) {
      this.userCopy = this.getUsers;
      return;
    }
    this.userCopy = this.getUsers.filter(item => item.TenantName.toLowerCase().indexOf(this.searchText.toLowerCase()) !== -1);
    // console.log(this.userCopy);
  }
}