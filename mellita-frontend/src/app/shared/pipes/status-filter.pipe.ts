import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'statusFilter' })
export class StatusFilterPipe implements PipeTransform {
  transform(items: any[], status: string): number {
    return items ? items.filter(i => i.statut === status).length : 0;
  }
}
