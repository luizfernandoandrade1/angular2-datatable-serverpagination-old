import {Directive, Input, EventEmitter, SimpleChange, OnChanges, DoCheck, Output} from "@angular/core";
import * as _ from "lodash";

export interface SortEvent {
    sortBy: string;
    sortOrder: string
}

export interface PageEvent {
    activePage: number;
    rowsOnPage: number;
    dataLength: number;
}

export interface DataEvent {
    length: number;
}

@Directive({
    selector: 'table[mfData]',
    exportAs: 'mfDataTable'
})
export class DataTable implements OnChanges, DoCheck {

    @Input("mfData") public inputData: any[] = [];
    @Input("mfRowsOnPage") public rowsOnPage = 1000;
    @Input("mfActivePage") public activePage = 1;
    @Input("mfAmountOfRows") public amountOfRows = 0;

    @Output("mfOnPageChange") public onPageChange = new EventEmitter<PageEvent>();

    private sortBy = "";
    private sortOrder = "asc";

    private mustRecalculateData = false;

    public data: any[];

    public onDataChange = new EventEmitter<DataEvent>();
    public onSortChange = new EventEmitter<SortEvent>();

    public getSort(): SortEvent {
        return {sortBy: this.sortBy, sortOrder: this.sortOrder};
    }

    public setSort(sortBy: string, sortOrder: string): void {
        if (this.sortBy !== sortBy || this.sortOrder !== sortOrder) {
            this.sortBy = sortBy;
            this.sortOrder = sortOrder;
            this.mustRecalculateData = true;
            this.onSortChange.emit({sortBy: sortBy, sortOrder: sortOrder});
        }
    }

    public getPage(): PageEvent {
        return {activePage: this.activePage, rowsOnPage: this.rowsOnPage, dataLength: this.amountOfRows};
    }

    public setPage(activePage: number, rowsOnPage: number): void {
        if (this.rowsOnPage !== rowsOnPage || this.activePage !== activePage) {
            this.activePage = this.activePage !== activePage ? activePage : this.calculateNewActivePage(this.rowsOnPage, rowsOnPage);
            this.rowsOnPage = rowsOnPage;
            this.mustRecalculateData = true;
            this.onPageChange.emit({
                activePage: this.activePage,
                rowsOnPage: this.rowsOnPage,
                dataLength: this.amountOfRows
            });
        }
    }

    private calculateNewActivePage(previousRowsOnPage: number, currentRowsOnPage: number): number {
        let firstRowOnPage = (this.activePage - 1) * previousRowsOnPage + 1;
        let newActivePage = Math.ceil(firstRowOnPage / currentRowsOnPage);
        return newActivePage;
    }

    public ngOnChanges(changes: {[key: string]: SimpleChange}): any {
        if (changes["inputData"]) {
            this.onDataChange.emit({
                length: this.amountOfRows
            });
            this.mustRecalculateData = true;
        }
        if (changes["activePage"] || changes["rowsOnPage"] || changes["amountOfRows"]) {
            this.onPageChange.emit({
                activePage: this.activePage,
                rowsOnPage: this.rowsOnPage,
                dataLength: this.amountOfRows
            });
        }
    }

    public ngDoCheck(): any {
        if (this.mustRecalculateData) {
            this.fillData();
            this.mustRecalculateData = false;
        }
    }

    private fillData(): void {
        let data = this.inputData;
        data = _.orderBy(data, [this.sortBy], [this.sortOrder]);
        this.data = data;
    }

}