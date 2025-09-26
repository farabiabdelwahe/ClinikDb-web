import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { Component } from '@angular/core';
import { adminGuard } from './guards/admin.guard';

// Simple placeholder component for the home route
@Component({
  template: '',
  standalone: true
})
class EmptyComponent { }

export const routes: Routes = [
  { path: '', component: EmptyComponent }, // Empty component - content handled by app.component.html
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' } // Wildcard route
];
