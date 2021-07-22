
// a helper class, used to define the electric component's location: row index and column index
class ComponentLocation {
     row: number;
     column: number;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
    }
    //get/set row index
    public Row(row?: number): number {
        if (row !== undefined)
            this.row = row;
        return this.row;
    }
    //get/set column index
    public Column(column?: number): number {
        if (column !== undefined)
            this.column = column
        return this.column;
    }
}
//this interface defines the list of properties that an ElectronicComponent must have
interface IElectricComponent {
    //get/set the location of the component
    Location(componentLocation?: ComponentLocation): ComponentLocation;
    //get/set the name of the component
    Name(name?: string): string;
    //fet/set the color of the text
    Forecolor(forecolor?: string): string;
    //get/set the state of the board for the electric component
    SwitchState(state?: boolean): boolean;
    //get the state of the component
    State: boolean;
    //get/set the image when the component is on
    OnImage(onImage?: string): string;
    //get/set the image when the component is off
    OffImage(offImage?: string): string;
}

//child component
class ElectricComponent extends HTMLElement implements IElectricComponent {
    //component's location object
    componentLocation: ComponentLocation;
    //name of the component
    name: string;
    //the slot name, where the component will be added
    slot: string;
    //text color
    forecolor: string;
    //state of the electric component
    State: boolean;
    //state of the board
    boardState: boolean;
    // image when the component is on
    onImage: string;
    // image when the component is off
    offImage: string;
    //used to customize the way of render state, 
    moreHtmlData: string = '';
    //the electric board where the component will be added
    parentBoard: ElectricBoard;

    constructor() {
        super();

        var row: number = parseInt(this.getAttribute('rowIndex'));
        var column: number = parseInt(this.getAttribute('columnIndex'));
        var location = new ComponentLocation(row, column);
        this.componentLocation = location;

        this.name = this.getAttribute('name');
        this.slot = '#component_' + this.componentLocation.row + this.componentLocation.column;

        this.setAttribute('slot', this.slot);
        this.forecolor = this.getAttribute('foreColor');
        this.onImage = this.getAttribute('onImageUrl');
        this.offImage = this.getAttribute('offImageUrl');
        this.State = (this.getAttribute('state') === 'true');
        this.boardState = false;
        this.moreHtmlData += this.getAttribute('moreHtmlData');

        const template2 = document.createElement('template');
        template2.innerHTML = '<style> .grid-item { background-color: rgba(255, 255, 255, 0.8); border: 1px solid rgba(0, 0, 0, 0.8);  padding: 20px; font-size: 30px; text-align: center; color: ' + this.forecolor + ' }'
            +' .button {  font-size: 24px; text-align: center; cursor: pointer; outline: none; color: #fff; background-color: red; border: none; border-radius: 15px;}'
            + ' </style>' +
            '<div id="electric-component" class="electric-component grid-item"><h3></h3><img/>' + this.moreHtmlData + '</div><button id="remove-button" title="Remove" class="button">X</button>';

        this.findParentBoard();

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template2.content.cloneNode(true));
        let name = this.name;
        if (!this.parentBoard.displayNames)
            name = '';
        this.shadowRoot.querySelector('h3').innerText = name; 
        if (this.moreHtmlData === '') {
            if (this.State && this.boardState)
                this.shadowRoot.querySelector('img').src = this.onImage;
            else
                this.shadowRoot.querySelector('img').src = this.offImage;
        }

        
    }
    //finds the parent board of the component and define the location of the component on the board
    findParentBoard(): void {
        let root = this.parentElement;
        if (root !== undefined) {
            let boardName: string = root.getAttribute('name');

            electricBoards.forEach((element) => {
                if (element.name == boardName) {
                    element.electricComponents.push(this);
                    this.parentBoard = element;
                    element.DefineElectricComponentsLocation(this);
                }
            });

        }

    }
    connectedCallback() {
        this.shadowRoot.querySelector('#remove-button').addEventListener('click', () => this.RemoveComponent());
    }
    disconnectedCallback() {
        this.shadowRoot.querySelector('#remove-button').removeEventListener;
    }

    Location(componentLocation?: ComponentLocation): ComponentLocation {
        if (componentLocation !== undefined)
            this.componentLocation = componentLocation;
        return this.componentLocation;
    }
    Name(name?: string): string {
        if (name !== undefined)
            this.name = name;
        return this.name;
    }
    Forecolor(forecolor?: string): string {
        if (forecolor !== undefined)
            this.forecolor = forecolor;
        return this.forecolor;
    }
    SwitchState(state?: boolean): boolean {
        let name = this.name;
        let onImage = this.onImage;
        let offImage = this.offImage;
        if (!this.parentBoard.displayNames)
            name = '';
        if (!(this.moreHtmlData === '')) {
            onImage = '';
            offImage = '';
        }
        if (state !== undefined) {
            this.boardState = state;
            if (this.State && this.boardState) {
                this.shadowRoot.querySelector('h3').innerText = name;
                this.shadowRoot.querySelector('img').src = onImage;
            }
            else {
                this.shadowRoot.querySelector('h3').innerText = name;
                this.shadowRoot.querySelector('img').src = offImage;
            }
        }

        return this.State;
    }
    OnImage(onImage?: string): string {
        if (onImage !== undefined)
            this.onImage = onImage;
        return this.onImage;
    }
    OffImage(offImage?: string): string {
        if (offImage !== undefined)
            this.offImage = offImage;
        return this.offImage;
    }
    //remove the component from the parent board
    RemoveComponent(): void {
        var index = this.parentBoard.electricComponents.indexOf(this, 0);
        if (index > -1) {
            this.parentBoard.electricComponents.splice(index, 1);
        }
        this.parentBoard.RemoveComponent(this);
    }
}

//this array is used to save all the electric boards that the customer might create
const electricBoards: ElectricBoard[] = [];


//parent component
class ElectricBoard extends HTMLElement {
    name: string;
    state: boolean;
    displayNames: boolean;
    rows: number;
    columns: number;
    backgroundColor: string;
    //array of the electric Components for this board
    electricComponents: ElectricComponent[] = [];
    constructor() {
        super();

        this.name = this.getAttribute('name');
        this.state = false;
        this.backgroundColor = this.getAttribute('backgroundcolor');
        this.displayNames = (this.getAttribute('displayComponentsName') === 'true');
        this.rows = parseInt(this.getAttribute('rowCount'));
        this.columns = parseInt(this.getAttribute('columnCount'));
            
        if (isNaN(this.columns)) {
            this.columns = 3;
        }
        if (isNaN(this.rows)) {
            this.rows = 3;
        }

        

        const template1 = document.createElement('template');
        template1.innerHTML = '<style> .electric-board { font-family: sans-serif;  color:blue;  margin: 15px; border-bottom: lightgrey 5px solid;}' +
            '.button { margin: inherit; padding: 15px 25px; font-size: 24px; text-align: center; cursor: pointer; outline: none; color: #fff; background-color: #e4c07d; border: none; border-radius: 15px; box-shadow: 0 9px #999;} .button: hover { background-color: grey } .button: active { background-color: grey;  box-shadow: 0 5px #666; transform: translateY(4px);}'+
            '</style>' +
            ' <div id="electric-board" class="electric-board"><button id="switch-state-button" class="button">Turn ON</button><h3></h3><div><div id="grid-container" class="grid-container"></div></div><h3></h3></div>';
        
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template1.content.cloneNode(true));
        this.BackgroundColor(this.backgroundColor);
        this.AddBoard(this);
        this.CreateDivsForElectricComponents();
        
    }
    connectedCallback() {
        this.shadowRoot.querySelector('#switch-state-button').addEventListener('click', () => this.SwitchState());
    }
    disconnectedCallback() {
        this.shadowRoot.querySelector('#switch-state-button').removeEventListener;
    }
    //switch the state of the board, and call the electricComponents SwitchState method
    SwitchState() {
        var btnSwitch = this.shadowRoot.querySelector('#switch-state-button');
        var components = this.shadowRoot.querySelector('electric-component');
        if (!this.state) {
            btnSwitch.innerHTML = "Turn OFF";
            this.state = true;
            // Call the child's SwitchState method
            this.electricComponents.forEach
                (item => {
                    item.SwitchState(this.state);
                });
            
        }
        else {
            btnSwitch.innerHTML = "Turn ON";
            this.state = false;
            //Call the child's SwitchState method
            this.electricComponents.forEach
                (item => {
                    item.SwitchState(this.state);
                });
        }
    }
    //get/set rowCount
    RowCount(rows?: number): number {
        if (rows !== undefined)
            this.rows = rows;
        return this.rows;
    }
    //get/set columnCount
    ColumnCount(columns?: number): number {
        if (columns !== undefined)
            this.columns = columns;
        return this.columns;
    }
    //get/set background color
    BackgroundColor(backgroundColor?: string): string {
        if (backgroundColor !== undefined) {
            this.backgroundColor = backgroundColor;
            var style = document.createElement('style')
            style.innerHTML = '.electric-board { background: ' + this.backgroundColor + '; border-radius: 30px} ' +
                '.grid-container { display: grid; grid-template-columns: repeat(' + this.columns + ', 1fr); background-color: ' + this.backgroundColor + '; padding: 10px; }' +
                ' .grid-item { background-color: rgba(255, 255, 255, 0.8); border: 1px solid rgba(0, 0, 0, 0.8); padding: 20px; font-size: 30px; text-align: center; }';

            this.shadowRoot.appendChild(style);
        }
        return this.backgroundColor;
    }
    //add board into the array of electric boards
    AddBoard(component: ElectricBoard): void {
        console.log('Trying to add the board component');
        electricBoards.push(component);
    }
    //Create divs for all possible locations where we can add electric components for this board
    CreateDivsForElectricComponents(): void {
        let divGrid = this.shadowRoot.querySelector('#grid-container');
        divGrid.innerHTML = '';
        let i: number; let j: number;

        for (i = 1; i <= this.rows; i++) {
            for (j = 1; j <= this.columns; j++) {
                divGrid.innerHTML += '<div class="grid-item" id="component_'+i+j+'">-' + i + j + '-</div>';
                
            }
        }
    }
    //define the electric component location on the board
    DefineElectricComponentsLocation(component: ElectricComponent): void {
        let divID = '#component_' + component.componentLocation.row + component.componentLocation.column;
        let divElement = this.shadowRoot.querySelector(divID);
        divElement.innerHTML = '<slot name="' + divID+'"></slot>';
        
        return;
    }
    //remove the electric component from the board
    RemoveComponent(component: ElectricComponent): void {
        let divID = '#component_' + component.componentLocation.row + component.componentLocation.column;
        let divElement = this.shadowRoot.querySelector(divID);
        divElement.innerHTML = '-' + component.componentLocation.row + component.componentLocation.column + '-';

        return;
    }
}

customElements.define('electric-board', ElectricBoard);
customElements.define('electric-component', ElectricComponent);
