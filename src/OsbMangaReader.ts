import {Component} from '@angular/core';

@Component({
    selector: 'osb-component-test',
    templateUrl: 'node_modules/osb-component-test/lib/OsbComponentTest.html',
    styleUrls: ['node_modules/osb-component-test/lib/OsbComponentTest.css']
})
export class OsbComponentTest {

    title = '';
    message = '';

    constructor() {
        this.title = 'OSB Component Test';
        this.message = 'Loaded';
        console.log(this);
    }

}