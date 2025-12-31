import {
    Controller,
    Get,
    Put,
    Param,
    Query,
    Body,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceFilterDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('admin/invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    /**
     * Get all invoices with filtering and pagination
     * GET /admin/invoices?search=...&startDate=...&endDate=...&status=...&page=1&limit=20
     */
    @Get()
    async getInvoices(@Query() filters: InvoiceFilterDto) {
        return this.invoiceService.getInvoices(filters);
    }

    /**
     * Get invoice statistics for dashboard
     * GET /admin/invoices/statistics
     */
    @Get('statistics')
    async getStatistics() {
        return this.invoiceService.getStatistics();
    }

    /**
     * Get all branches for filter dropdown
     * GET /admin/invoices/branches
     */
    @Get('branches')
    async getBranches() {
        return this.invoiceService.getBranches();
    }

    /**
     * Get invoice by ID with full details
     * GET /admin/invoices/:id
     */
    @Get(':id')
    async getInvoiceById(@Param('id', ParseIntPipe) id: number) {
        return this.invoiceService.getInvoiceById(id);
    }

    /**
     * Update invoice status
     * PUT /admin/invoices/:id/status
     */
    @Put(':id/status')
    async updateInvoiceStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateInvoiceStatusDto,
    ) {
        return this.invoiceService.updateInvoiceStatus(id, dto);
    }
}
