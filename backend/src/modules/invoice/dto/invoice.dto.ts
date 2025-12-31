import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    maChiNhanh?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maKhachHang?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minAmount?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxAmount?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC';
}

export class UpdateInvoiceStatusDto {
    @IsString()
    status: string;
}
