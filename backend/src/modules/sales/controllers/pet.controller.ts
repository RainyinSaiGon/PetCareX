import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PetService, CreatePetDto, UpdatePetDto, PetResponseDto } from '../services/pet.service';

@Controller('api/pets')
@UseGuards(JwtAuthGuard)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPet(
    @Query('customerId') customerId: string,
    @Body() createPetDto: CreatePetDto,
  ): Promise<PetResponseDto> {
    return this.petService.createPet(parseInt(customerId), createPetDto);
  }

  @Get(':id')
  async getPetById(@Param('id') petId: string): Promise<PetResponseDto> {
    return this.petService.getPetById(parseInt(petId));
  }

  @Get('customer/:customerId')
  async getCustomerPets(@Param('customerId') customerId: string): Promise<PetResponseDto[]> {
    return this.petService.getCustomerPets(parseInt(customerId));
  }

  @Put(':id')
  async updatePet(
    @Param('id') petId: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<PetResponseDto> {
    return this.petService.updatePet(parseInt(petId), updatePetDto);
  }

  @Delete(':id')
  async deletePet(@Param('id') petId: string): Promise<{ success: boolean; message: string }> {
    return this.petService.deletePet(parseInt(petId));
  }

  @Get(':id/medical-history')
  async getPetMedicalHistory(@Param('id') petId: string): Promise<any[]> {
    return this.petService.getPetMedicalHistory(parseInt(petId));
  }

  @Get('statistics/overview')
  async getPetStatistics(): Promise<{
    totalPets: number;
    petsByType: Record<string, number>;
    petsPerCustomer: number;
  }> {
    return this.petService.getPetStatistics();
  }

  @Get('search/query')
  async searchPets(@Query('q') query: string): Promise<PetResponseDto[]> {
    if (!query || query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    return this.petService.searchPets(query);
  }
}

