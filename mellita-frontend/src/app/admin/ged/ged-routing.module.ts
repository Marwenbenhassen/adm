import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadComponent: () => import('./components/document-list.component').then(m => m.GedDocumentListComponent) },
  { path: 'upload', loadComponent: () => import('./components/document-upload.component').then(m => m.GedDocumentUploadComponent) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GedRoutingModule { }
