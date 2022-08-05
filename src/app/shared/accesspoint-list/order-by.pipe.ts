import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(value: Array<any>, predicate?: string, reverse?: boolean): any {
    if (!value) return value;

    const sortedArray = value.slice().sort((a: any, b: any): number => {
      return this.defaultComparerExpression(
        this.getPredicateValue(a, predicate),
        this.getPredicateValue(b, predicate)
      );
    });

    return reverse
      ? sortedArray.reverse()
      : sortedArray;
  }

  private defaultComparerExpression(a: any, b: any): number {
    if (a == null) return 1;
    if (b == null) return -1;
    
    if (a && a instanceof Date) a = a.getTime();
    if (b && b instanceof Date) b = b.getTime();
    
    if (a === b) return 0;

    return (a > b) ? 1 : -1;
  }

  private getPredicateValue(object: any, predicate: string): any {
    if (!object) return;
    if (!(predicate in object)) return;
    
    return (typeof object[predicate] === 'function')
      ? object[predicate]()
      : object[predicate];
  }
}
