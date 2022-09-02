import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioComponent } from './audio/audio.component';
import { SdkComponent } from './sdk/sdk.component';
import { VideoComponent } from './video/video.component';

const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  {
    path: 'user',
    component: SdkComponent,
  },
  {
    path: 'user/:id/:stmp',
    component: SdkComponent,
  },
  { path: 'video/:id/:username', component: VideoComponent },
  { path: 'audio/:id/:username', component: AudioComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
