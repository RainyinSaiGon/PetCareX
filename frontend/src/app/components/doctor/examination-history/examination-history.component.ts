import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-examination-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './examination-history.component.html',
  styleUrls: ['./examination-history.component.css'],
})
export class ExaminationHistoryComponent implements OnInit {
  histories: any[] = [];
  maThuCung: number = 0;
  isLoading = false;

  constructor(
    private doctorService: DoctorService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.maThuCung = params['maThuCung'];
      if (this.maThuCung) {
        this.loadExaminationHistory();
      }
    });
  }

  loadExaminationHistory(): void {
    this.isLoading = true;
    this.doctorService.getPetExaminationHistory(this.maThuCung).subscribe({
      next: (response: any[]) => {
        this.histories = response;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading examination history:', error);
        this.isLoading = false;
        alert('Failed to load examination history');
      },
    });
  }

  getSymptomsList(symptoms: string[]): string {
    return symptoms?.join(', ') || '-';
  }

  getDiagnosisList(diagnoses: string[]): string {
    return diagnoses?.join(', ') || '-';
  }
}
