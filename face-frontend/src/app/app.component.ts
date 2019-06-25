import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  constructor(
    private firestorage: AngularFirestore,
    private storage: AngularFireStorage) {}

  uploadFile(event:any) {
    console.log(event)
    const file = event.target.files[0];
    console.log(file);

    const filePath = file.name;

    const fileId = filePath.split('.jpg')[0];

    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();

    // get notified when the download URL is available
    task.snapshotChanges().pipe(finalize(() => this.downloadURL = fileRef.getDownloadURL())).subscribe();

    // get collection item from file
    let docRef = this.firestorage.collection("photos").doc(fileId);

    docRef.snapshotChanges().subscribe(res => {
      console.log(res);
      console.log(res.payload);
      console.log(res.payload.data());
    });

  }
}
