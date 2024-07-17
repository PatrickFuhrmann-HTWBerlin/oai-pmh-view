let currentPage = 0;
const pageSize = 10;
let items = [];
let current_schema      = 'oai_dc' ;
let current_service  ; 
let availableSchemas    = {} 
let availableEndpoints  = {}
let availableHarvester  = {}
let errorMessage = document.getElementById('errorMessage');
if( errorMessage ){
    errorMessage.onclick = function() {
        errorMessage.innerHTML = ""
    }
}
const header_text = document.getElementById('header-text');
let pleaseWaitCounter = 0 ;
function pleaseWait( mode ){ 

    if( mode ){
        header_text.innerHTML = "OAI-PMH Viewer (please wait)" ;
        header_text.style.color = "red";
    }else{
        header_text.innerHTML = "OAI-PMH Viewer" ;
        header_text.style.color = "green";
    }
}
// ---------------------------------------
function fetchIdentifiers( schema  ) {
// ---------------------------------------
    current_schema  = schema;

    setDataBlockHeader( current_schema );
    console.log("Loading : ["+current_schema+"]")

    currentPage = 0;
    const requestURL = `/api/${current_service.key}?verb=ListIdentifiers&metadataPrefix=${current_schema}` 
    console.log("fetchIdentifiers: "+requestURL)
    pleaseWait( true )
    fetch(requestURL)
        .then(response => { pleaseWait(false) ; return response.text() } )
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            error = Array.from(data.querySelectorAll('error'));
            if( error && error.length > 0 ){
                console.error( error[0].textContent )
                throw Error(error[0].textContent)
            }
            items = Array.from(data.querySelectorAll('header'));
            displayPage(currentPage);
        })
        .catch(err => {
            console.error('Error loading XML data:', err)
            displayErrorMessage(""+err)
        }).finally(() => { });
}
// ---------------------------------------
function fetchDetails() {
// ---------------------------------------
       
    const identifier = this.identifier;

    const requestURL = `/api/${current_service.key}?verb=GetRecord&identifier=${identifier}&metadataPrefix=${current_schema}` 
    console.log("fetchDetails: "+requestURL);
    pleaseWait( true )
    fetch(requestURL)
        .then(response => { pleaseWait(false) ; return response.text() } )
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => { 
            error = Array.from(data.querySelectorAll('error'));
            if( error && error.length > 0 ){
                console.error( error[0].textContent )
                throw Error(error[0].textContent)
            }
             createDetailTable( identifier , data ) 
        } )
        .catch(err => console.error('Error loading XML data:', err))
        .finally(() => {  }  );
}
// ---------------------------------------
function fetchSchemas() {
// ---------------------------------------
           
    const requestURL = `/api/${current_service.key}?verb=ListMetadataFormats`    
    console.log("fetchSchemass : "+requestURL);
    pleaseWait( true )
    fetch(requestURL, { method: 'GET', headers: { 'Accept': 'application/xml' }})
        .then(response =>  { pleaseWait(false) ; return response.text() }  )
        .then(str => { console.log(str) ; return (new window.DOMParser()).parseFromString(str, "text/xml") })
        .then(data => { 
            error = Array.from(data.querySelectorAll('error'));
            if( error && error.length > 0 ){
                console.error( error[0].textContent )
                throw Error(error[0].textContent)
            }
            storeAvailableSchemas( data )
            if( availableSchemas['oai_dc'] )fetchIdentifiers( 'oai_dc' )
        } )
        .catch(err => console.error('Error loading XML data:', err))
        .finally(() => {  }  );
}
// ---------------------------------------
function fetchEndpoints() {
// ---------------------------------------
       
    console.log("Fetching Endpoints");  
    pleaseWait( true )
    fetch('/endpoints')
        .then(response => { pleaseWait(false) ; return response.json() } )
        .then(data => {
            storeEndpoints( data )
            createServerTable( availableEndpoints )
            createHarvesterTable( availableHarvester )
        } )
        .catch(err => console.error('Error loading Endpoint Data: ', err))
        .finally(() => { }  );
}    
// ---------------------------------------
function convertSchemaXML(data) {
// ---------------------------------------
    var result = {}
    var list = data.querySelectorAll('ListMetadataFormats')
    for (let formats of list) {
        for( let format_key_list of formats.children ){
            const format_keys = {}
            for( let x of format_key_list.children ){
                format_keys[x.nodeName] = x.textContent ;
            }
            let key = format_keys['metadataPrefix'] ;
            if( key )result[key] = format_keys ;
        }
    }
    return result ;
}
// ---------------------------------------
function storeAvailableSchemas(data) {
// ---------------------------------------
    availableSchemas = convertSchemaXML( data );

    console.log( availableSchemas)

    clearDirectoryTable()
    clearDetailTable()
    setDataBlockHeader("")

    createSchemaTable(availableSchemas)
}    
// ---------------------------------------
function storeEndpoints( endpoints) {
// ---------------------------------------
    console.log(endpoints)
    availableEndpoints = endpoints.reduce((acc, item) => {
        if( item.type && ( item.type == 'harvester' ) )return acc ;
        acc[item.key] = item;
        return acc;
     }, {});
     availableHarvester = endpoints.reduce((acc, item) => {
        if( ! ( item.type && ( item.type == 'harvester' ) ) )return acc ;
        acc[item.key] = item;
        return acc;
     }, {});
    console.log("availableEndpoints")
    console.log(availableEndpoints)
    console.log("availableHarvester")
    console.log(availableHarvester)
}  
// ---------------------------------------
function getKey( item , key ){
// ---------------------------------------
   const x = item.querySelector(key);
   return x ? x.textContent : "N.A."
}
// ---------------------------------------
function setSchemaHeader( serverName ){
// ---------------------------------------
   const schema_header = document.getElementById('schema-header');
   schema_header.innerHTML = "Available Schema of "+serverName ;
}
// ---------------------------------------
function displayErrorMessage( message ){
// ---------------------------------------
        if( errorMessage )errorMessage.innerHTML = message ;
}
// ---------------------------------------
function getAllDescendants(nodes,collector) {
// ---------------------------------------
    for (let resource of nodes) {
       for( let item of resource.children ){
           for( let xx of item.children ){
              if( xx.children.length > 0){
                  let position = 0
                  for( let subItem of xx.children ){
                      let value = xx.textContent ;
                      let attrValues = "("
                      for( let attr of subItem.attributes){
                         console.log(attr.name + ': ' + attr.value)
                         attrValues = attrValues  + attr.value+ "," ;
                      }
                      if( attrValues == "("){
                         attrValues = "";
                      }else{
                         attrValues = attrValues.slice(0,-1) + ")";
                      }
                      collector[subItem.nodeName+"["+position+"]"+attrValues] = value ;
                      position = position + 1;
                  }         
              }else{
                  collector[xx.nodeName] = xx.textContent;
              }
            }
       }
    }
}
    
// ---------------------------------------
function setDataBlockHeader( name ){
// ---------------------------------------

    const schemaName = document.getElementById('data-header');
    console.log("Setting "+schemaName+" "+name)
    schemaName.textContent = "Schema <"+name+">";
    schemaName.className   = 'data-header'
}
// ---------------------------------------
function createDetailTable( identifier , data ){
// ---------------------------------------
        
    const detailContainer = document.getElementById('detail');
    detailContainer.innerHTML = '' ;
    const h = document.createElement('h3')
    h.innerHTML = identifier;
    detailContainer.appendChild(h)
    
    const table     = document.createElement('table');
    const header    = table.createTHead();
    const headerRow = header.insertRow();

    [ "Name", "Value"].forEach(text => {
        let th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    const collector = {} ;

    getAllDescendants( data.querySelectorAll('metadata') ,collector) ;

    for (const key in collector) {
        if (collector.hasOwnProperty(key)) {
            console.log(`${key}: ${collector[key]}`);
            const row         = table.insertRow();
            const titleColumn = row.insertCell();
            titleColumn.textContent = key ;
            titleColumn.className   = 'title' ;
            row.insertCell().textContent = collector[key] ;
    
        }
    }
    
    detailContainer.appendChild(table);
}    
// ---------------------------------------
function clearDetailTable() {
// ---------------------------------------
   const container = document.getElementById('detail');
   container.innerHTML = '';
}
// ---------------------------------------
function clearDirectoryTable() {
// ---------------------------------------
       const container = document.getElementById('directory-container');
       container.innerHTML = '';
}   
// ---------------------------------------
function displayPage(page) {
// ---------------------------------------
    const container = document.getElementById('directory-container');
    container.innerHTML = '';
    const table = document.createElement('table');

    // Header setup if needed
    const header    = table.createTHead();
    const headerRow = header.insertRow();
    ["Action", "Identifier", "Time Recorded"].forEach(text => {
        let th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    // Ensuring button is in the first cell
    const pageItems = items.slice(page * pageSize, (page + 1) * pageSize);
    pageItems.forEach((item, index) => {
        const row = table.insertRow();
        const buttonCell = row.insertCell();
        buttonCell.className = 'button-cell';
        
        identifier = item.querySelector('identifier').textContent;
        datestamp  = item.querySelector('datestamp').textContent;

        const detailButton = document.createElement('button');
        detailButton.textContent = 'Details' ;
        detailButton.identifier  = identifier ;
        detailButton.onclick     = fetchDetails;

        buttonCell.appendChild(detailButton);

        // Adding other data cells
        row.insertCell().textContent = identifier ;
        row.insertCell().textContent = datestamp;
    });

    container.appendChild(table);
}
// ---------------------------------------
function displayPage2(page) {
// ---------------------------------------
        const container = document.getElementById('directory-container');
        container.innerHTML = '';
        const table = document.createElement('table');
    
        // Header setup if needed
        const header    = table.createTHead();
        const headerRow = header.insertRow();
        ["Action", "Identifier", "Time Recorded"].forEach(text => {
            let th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
    
        // Ensuring button is in the first cell
        const pageItems = items.slice(page * pageSize, (page + 1) * pageSize);
        pageItems.forEach((item, index) => {
            const row = table.insertRow();
            const buttonCell = row.insertCell();
            buttonCell.className = 'button-cell';
            
            identifier = item.querySelector('identifier').textContent;
            datestamp  = item.querySelector('datestamp').textContent;
    
            const detailButton = document.createElement('button');
            detailButton.textContent = 'Details' ;
            detailButton.identifier  = identifier ;
            detailButton.onclick     = fetchDetails;
    
            buttonCell.appendChild(detailButton);
    
            // Adding other data cells
            row.insertCell().textContent = identifier ;
            row.insertCell().textContent = datestamp;
        });
    
        container.appendChild(table);
    }
// ---------------------------------------
function nextPage() {
// ---------------------------------------
    if ((currentPage + 1) * pageSize < items.length) {
        currentPage++;
        displayPage(currentPage);
    }
}
// ---------------------------------------
function prevPage() {
// ---------------------------------------
    if (currentPage > 0) {
        currentPage--;
        displayPage(currentPage);
    }
}
// ---------------------------------------
function on_schema_click( details ){
// ---------------------------------------
   const data_header = details.srcElement.innerText ;
   fetchIdentifiers( data_header )
}
// ---------------------------------------
function on_server_click( details ){
// ---------------------------------------
   const server_name = details.srcElement.innerText ;
   setSchemaHeader( server_name )
   current_service = availableEndpoints[server_name] ;
   if( ! ( current_service = availableEndpoints[server_name] ) ){
        current_service = availableHarvester[server_name]
   }
   clearSchemaTable()
   clearDetailTable()
   clearDirectoryTable()
   fetchSchemas()
}
// server-table-div
// ---------------------------------------
function createServerTable( servers ){
// ---------------------------------------
    createServerHarvesterTable( servers , 'server-container' )
}
// ---------------------------------------
function createHarvesterTable( servers ){
// ---------------------------------------
    createServerHarvesterTable( servers , 'harvester-container' )
}
// ---------------------------------------
function createServerHarvesterTable( servers , servertype ){
// ---------------------------------------
        const div_container = document.getElementById(servertype);
        for( const k in servers ){
            
            const button  = document.createElement('button');
            button.className = "server-button"
            button.addEventListener('click',on_server_click);
            button.innerText = k ;

            const table  = document.createElement('table');
            table.className = "button-table"

            var tr = document.createElement('tr');
            var td = document.createElement('td');

            td.className = "description" ;
            td.innerHTML = servers[k].description;
            tr.appendChild(td)
            table.appendChild(tr)

            tr = document.createElement('tr');
            td = document.createElement('td');

            td.appendChild(button);
            td.className = "description" ;
            tr.appendChild(td)

            table.appendChild(tr)
            div_container.appendChild(table);
        }
}
// ---------------------------------------
function createServerTable2( servers ){
// ---------------------------------------
    const table = document.getElementById('server_table');
    const row  = document.createElement('tr');
    for( const k in servers ){
       const cell = document.createElement('td');
       const button  = document.createElement('button');
       button.addEventListener('click',on_server_click);
       button.innerText = k ;
       cell.appendChild(button);
       row.appendChild(cell);
    }
    table.appendChild(row);
}
// ---------------------------------------
function clearSchemaTable(){
// ---------------------------------------
    const table = document.getElementById('schema-table');
    table.innerHTML = ''
}
// ---------------------------------------
function createSchemaTable(dict){
// ---------------------------------------
        const table = document.getElementById('schema-table');
        table.innerHTML = ''
        for (let key in dict) {
            if( ! dict.hasOwnProperty(key) )continue ;
            console.log(key, dict[key]);
            schema_row = dict[key]
    
            const row1    = document.createElement('tr');
            const cell1_1 = document.createElement('td');
            const button  = document.createElement('button');
            button.className = "button-cell";
            button.innerText = schema_row["metadataPrefix"] ;
            button.addEventListener('click',on_schema_click);
            cell1_1.appendChild(button);
    
            cell1_1.className   = "button-cell"
            row1.appendChild(cell1_1);
    
            const cell1_2 = document.createElement('td');
            cell1_2.className = "schema_table_body";
            cell1_2.textContent = schema_row["schema"];
            row1.appendChild(cell1_2);
        
            const cell2_2 = document.createElement('td');
            cell2_2.className = "schema_table_body";
    
            cell2_2.textContent = schema_row["metadataNamespace"];
            row1.appendChild(cell2_2);

            table.appendChild(row1);

            table.appendChild(row1);
        }
    }

// Initial data load

// fetchSchemas()

setDataBlockHeader( "None" );
fetchEndpoints()

//
//
// -------- NOT USED -------------------
//
// ---------------------------------------
function createSchemaTable_two_rows(dict){
// ---------------------------------------
    const table = document.getElementById('schema-table');
    table.innerHTML = ''
    
    for (let key in dict) {
            if( ! dict.hasOwnProperty(key) )continue ;
            console.log(key, dict[key]);
            schema_row = dict[key]
    
            const row1    = document.createElement('tr');
            const cell1_1 = document.createElement('td');
            const button  = document.createElement('button');
            button.innerText = schema_row["metadataPrefix"] ;
            button.addEventListener('click',on_schema_click);
         //   cell1_1.textContent = schema_row["metadataPrefix"] ;
            cell1_1.appendChild(button);
    
            cell1_1.rowSpan     = 2; // This cell will span two rows
            cell1_1.className   = "button-cell"
            row1.appendChild(cell1_1);
    
            const cell1_2 = document.createElement('td');
            cell1_2.className = "schema_table_body";
            cell1_2.textContent = schema_row["schema"];
            row1.appendChild(cell1_2);
    
            table.appendChild(row1);
    
            const row2 = document.createElement('tr');
            const cell2_2 = document.createElement('td');
            cell2_2.className = "schema_table_body";
    
            cell2_2.textContent = schema_row["metadataNamespace"];
            row2.appendChild(cell2_2);
    
            table.appendChild(row2);
    }
}
// ---------------------------------------
function drawXDetailTable( identifier , data ){
// ---------------------------------------
    
    const detailContainer = document.getElementById('detail');
    detailContainer.innerHTML = '' ;
    const h = document.createElement('h3')
    h.innerHTML = identifier;
    detailContainer.appendChild(h)
    
    const table     = document.createElement('table');
    const header    = table.createTHead();
    const headerRow = header.insertRow();
    
    [ "Name", "Value"].forEach(text => {
        let th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
     });
    
     let root = data.querySelectorAll('metadata')
    
    detailContainer.appendChild(table);
}
dictexample = { 
    oai_dc : { metadataFormat : "oai_dc" , schema : "akdasdf" , metadataNamespace : "adfjadf"} ,
    panosc : { metadataFormat : "panosc" , schema : "akdasdf" , metadataNamespace : "adfjadf"} ,
    data_cite : { metadataFormat : "datasite" , schema : "akdasdf" , metadataNamespace : "adfjadf"} 
};
// ---------------------------------------
function getAllDescendants2(nodes,collector) {
    // ---------------------------------------
        for (let child of nodes) {
           children = child.children
           if( children.length == 0 ){
              console.log(child.nodeName+" : " +child.textContent);
                collector[child.nodeName] = child.textContent
           }else{
               console.log(child.nodeName);
               let subChildren = getAllDescendants(children,collector);
           }
        }
    }
    
    
