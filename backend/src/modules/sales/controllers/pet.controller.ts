import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PetService } from '../services/pet.service';
import { CreatePetDto, UpdatePetDto, PetResponseDto } from '../dto/pet.dto';

@Controller('api/pets')
@UseGuards(JwtAuthGuard)
export class PetController {
  constructor(private readonly petService: PetService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPet(
    @Query('customerId') customerId: string,
    @Body() createPetDto: CreatePetDto,
  ): Promise<PetResponseDto> {
    return this.petService.createPet(parseInt(customerId), createPetDto);
  }

  @Get()
  async getAllPets(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ): Promise<{
    data: PetResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.petService.getAllPets(
      parseInt(page),
      parseInt(limit),
      search
    );
  }

  // Static routes MUST come before dynamic :id route
  @Get('search/query')
  async searchPets(@Query('q') query: string): Promise<PetResponseDto[]> {
    if (!query || query.length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }
    return this.petService.searchPets(query);
  }

  @Get('statistics/overview')
  async getPetStatistics(): Promise<{
    totalPets: number;
    petsByType: Record<string, number>;
    petsPerCustomer: number;
  }> {
    return this.petService.getPetStatistics();
  }

  @Get('customer/:customerId')
  async getCustomerPets(
    @Param('customerId') customerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ): Promise<{
    data: PetResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.petService.getCustomerPets(
      parseInt(customerId),
      parseInt(page),
      parseInt(limit),
      search
    );
  }

  // Dynamic :id route MUST come after all static routes
  @Get(':id')
  async getPetById(@Param('id') petId: string): Promise<PetResponseDto> {
    return this.petService.getPetById(parseInt(petId));
  }

  @Get(':id/medical-history')
  async getPetMedicalHistory(@Param('id') petId: string): Promise<any[]> {
    return this.petService.getPetMedicalHistory(parseInt(petId));
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
}

