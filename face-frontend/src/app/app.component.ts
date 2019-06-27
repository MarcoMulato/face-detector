import { Component, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize, delay } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  nombreSubida:String ="Sube algo";
  show:boolean=false;
  showPB:boolean=false;
  lista:any;
  nombre:string="";
  @ViewChild("video",{ static:false})
    public video: ElementRef;

    @ViewChild("canvas",{ static:false})
    public canvas: ElementRef;

    public captures: Array<any>;
  
  constructor(
    private firestorage: AngularFirestore,
    private storage: AngularFireStorage) { this.captures = [];}
    public ngAfterViewInit() {
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
              this.video.nativeElement.srcObject = stream;
              this.video.nativeElement.play();
          });
      }
  }

  public capture() {
      var context = this.canvas.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, 640, 480);
      this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
      const capture = this.canvas.nativeElement.toDataURL("image/png")
      this.showPB=true;
      this.nombre = "Imagen-"+Date.now()
      
      this.nombre = "Imagen-"+Date.now()+".jpg"
      const fileRef = this.storage.ref(this.nombre);
      let fileId =  this.nombre.split('.jpg')[0];
      const task = this.storage.ref(this.nombre).putString(capture,"data_url")
      // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(finalize(() => this.downloadURL = fileRef.getDownloadURL())).subscribe();

    // get collection item from file
    let docRef = this.firestorage.collection("photos").doc(fileId);

    docRef.snapshotChanges().subscribe(res => {
      //console.log(res);
      //console.log(res.payload);
      //console.log(res.payload.data());
      this.lista=res.payload.data()
    });
    task.percentageChanges().pipe(finalize(() =>this.show=true)).subscribe();
  }

  uploadFile(event:any) {
      //console.log("El evento: ", event)
    this.showPB=true;
    //console.log("DFAWCAWERCWERCAWER: ", this.uploadPercent)
    //console.log(event)
    const file = event.target.files[0];
    ////console.log(file);

    const filePath = file.name;
    //console.log(filePath);
    this.nombreSubida = file.name;
    let fileId;
    if(filePath.includes('.jpg')){

      fileId = filePath.split('.jpg')[0];
    
    }
    else if (filePath.includes('.png')){

      fileId = filePath.split('.png')[0];

    }
    else if(filePath.includes('.jpeg')){

      fileId = filePath.split('.jpeg')[0];

    }

    const fileRef = this.storage.ref(filePath);
    //console.log("LA NUEVA WEA: ", fileRef)
    const task =  this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(finalize(() => this.downloadURL = fileRef.getDownloadURL())).subscribe();

    // get collection item from file
    let docRef = this.firestorage.collection("photos").doc(fileId);

    docRef.snapshotChanges().subscribe(res => {
      //console.log(res);
      //console.log(res.payload);
      //console.log(res.payload.data());
      this.lista=res.payload.data()
    });
    task.percentageChanges().pipe(finalize(() =>this.show=true)).subscribe();
      
    
  }
}
