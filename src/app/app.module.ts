import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SdkComponent } from './sdk/sdk.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { VideoComponent } from './video/video.component';
import { AudioComponent } from './audio/audio.component';
import { environment } from 'src/environments/environment';
// Import Firebase modules + environment
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';
import { MessagingService } from './services/messaging.service';
import { StreamService } from './services/stream.service';
import { DatePipe } from '@angular/common';


@NgModule({
  declarations: [AppComponent, SdkComponent, VideoComponent, AudioComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    ToastrModule.forRoot(),
    ToastNoAnimationModule.forRoot(),
  ],
  providers: [MessagingService, StreamService, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule { }
