import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-config',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-config.component.html',
  styleUrls: ['./admin-config.component.css'],
  standalone: true
})
export class AdminConfigComponent implements OnInit {
  private http = inject(HttpClient);
  
  configJson = signal<string>('');
  adminKey = signal<string>('');
  statusMessage = signal<{text: string, type: 'success' | 'error' | 'loading' | null}>({ text: '', type: null });

  ngOnInit() {
    this.loadCurrentConfig();
  }

  loadCurrentConfig() {
    this.statusMessage.set({ text: 'Loading current config...', type: 'loading' });
    this.http.get<any>(`${environment.apiUrl}/config`).subscribe({
      next: (config) => {
        this.configJson.set(JSON.stringify(config, null, 2));
        this.statusMessage.set({ text: '', type: null });
      },
      error: (err) => {
        console.error('Error fetching config', err);
        this.statusMessage.set({ text: 'Failed to load configuration.', type: 'error' });
      }
    });
  }

  saveConfig() {
    this.statusMessage.set({ text: 'Saving...', type: 'loading' });
    let parsedConfig;
    
    try {
      parsedConfig = JSON.parse(this.configJson());
    } catch (e) {
      this.statusMessage.set({ text: 'Invalid JSON format. Please check your syntax.', type: 'error' });
      return;
    }

    if (!this.adminKey()) {
      this.statusMessage.set({ text: 'Admin Key is required to save changes.', type: 'error' });
      return;
    }

    const headers = new HttpHeaders().set('x-admin-key', this.adminKey());

    this.http.put(`${environment.apiUrl}/admin/config`, parsedConfig, { headers }).subscribe({
      next: () => {
        this.statusMessage.set({ text: 'Configuration saved successfully!', type: 'success' });
        setTimeout(() => this.statusMessage.set({ text: '', type: null }), 3000);
      },
      error: (err) => {
        console.error('Save error:', err);
        if (err.status === 401 || err.status === 403) {
          this.statusMessage.set({ text: 'Unauthorized: Invalid Admin Key.', type: 'error' });
        } else {
          this.statusMessage.set({ text: 'Failed to save configuration. Check server logs.', type: 'error' });
        }
      }
    });
  }
}
