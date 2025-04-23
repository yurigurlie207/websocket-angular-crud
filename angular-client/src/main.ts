import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


  window.addEventListener("DOMContentLoaded", () => {
    const label = document.getElementById("priority") as HTMLElement | null;
  
    console.log(label);
  
    if (label && label.textContent?.trim() === "Hi-Pri") {
      label.classList.add("highlightGreen");
    }
  });