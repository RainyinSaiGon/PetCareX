import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { SearchPetExaminationDto } from './dto/search-pet-examination.dto';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { SearchMedicineDto } from './dto/search-medicine.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('doctor')
@UseGuards(JwtAuthGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }

  /**
   * Search pet examination records
   * GET /doctor/examinations/search?maThuCung=1&tenThuCung=name
   */
  @Get('examinations/search')
  async searchExaminations(@Query() searchDto: SearchPetExaminationDto) {
    return await this.doctorService.searchPetExaminations(searchDto);
  }

  /**
   * Get examination history for a pet
   * GET /doctor/pets/:maThuCung/examination-history
   */
  @Get('pets/:maThuCung/examination-history')
  async getExaminationHistory(@Param('maThuCung', ParseIntPipe) maThuCung: number) {
    return await this.doctorService.getPetExaminationHistory(maThuCung);
  }

  /**
   * Get examination details by ID
   * GET /doctor/examinations/:maGiayKhamTongQuat
   */
  @Get('examinations/:maGiayKhamTongQuat')
  async getExaminationDetails(@Param('maGiayKhamTongQuat', ParseIntPipe) maGiayKhamTongQuat: number) {
    return await this.doctorService.getExaminationDetails(maGiayKhamTongQuat);
  }

  /**
   * Check if pet has existing medical record
   * GET /doctor/pets/:maThuCung/medical-record-status
   */
  @Get('pets/:maThuCung/medical-record-status')
  async checkMedicalRecordStatus(@Param('maThuCung', ParseIntPipe) maThuCung: number) {
    return await this.doctorService.checkPetMedicalRecordStatus(maThuCung);
  }

  /**
   * Create new examination record
   * POST /doctor/examinations
   */
  @Post('examinations')
  async createExamination(
    @Body() createExaminationDto: CreateExaminationDto,
    @Request() req,
  ) {
    const maBacSi = req.user?.ma_nhan_vien || 'UNKNOWN';
    return await this.doctorService.createExamination(createExaminationDto, maBacSi);
  }

  /**
   * Update examination record
   * PATCH /doctor/examinations/:maGiayKhamTongQuat
   */
  @Patch('examinations/:maGiayKhamTongQuat')
  async updateExamination(
    @Param('maGiayKhamTongQuat', ParseIntPipe) maGiayKhamTongQuat: number,
    @Body() updateData: Partial<CreateExaminationDto>,
  ) {
    return await this.doctorService.updateExamination(maGiayKhamTongQuat, updateData);
  }

  /**
   * Delete examination record
   * DELETE /doctor/examinations/:maGiayKhamTongQuat
   */
  @Delete('examinations/:maGiayKhamTongQuat')
  async deleteExamination(@Param('maGiayKhamTongQuat', ParseIntPipe) maGiayKhamTongQuat: number) {
    return await this.doctorService.deleteExamination(maGiayKhamTongQuat);
  }

  /**
   * Search medicines
   * GET /doctor/medicines/search?tenSanPham=name
   */
  @Get('medicines/search')
  async searchMedicines(@Query() searchDto: SearchMedicineDto) {
    return await this.doctorService.searchMedicines(searchDto);
  }

  /**
   * Get all medicines
   * GET /doctor/medicines
   */
  @Get('medicines')
  async getAllMedicines(@Query('skip') skip: number = 0, @Query('take') take: number = 10) {
    return await this.doctorService.searchMedicines({ skip, take });
  }

  /**
   * Create new prescription
   * POST /doctor/prescriptions
   */
  @Post('prescriptions')
  async createPrescription(
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @Request() req,
  ) {
    const maBacSi = req.user?.ma_nhan_vien || 'UNKNOWN';
    return await this.doctorService.createPrescription(createPrescriptionDto, maBacSi);
  }

  /**
   * Get prescription details
   * GET /doctor/prescriptions/:maToaThuoc
   */
  @Get('prescriptions/:maToaThuoc')
  async getPrescriptionDetails(@Param('maToaThuoc', ParseIntPipe) maToaThuoc: number) {
    return await this.doctorService.getPrescriptionDetails(maToaThuoc);
  }

  /**
   * Get prescriptions for a pet
   * GET /doctor/pets/:maThuCung/prescriptions
   */
  @Get('pets/:maThuCung/prescriptions')
  async getPrescriptionsForPet(@Param('maThuCung', ParseIntPipe) maThuCung: number) {
    return await this.doctorService.getPrescriptionsForPet(maThuCung);
  }
}
