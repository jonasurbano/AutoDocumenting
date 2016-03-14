var http = "http://";
var token = null;

$(document).ready(function () {
    renderVariableFunction = renderVariable;
    renderDataProviderFunction = renderDataProvider;
    renderObjectsFunction = renderObjects;
    renderDocumentNameFunction = renderDocumentName;
    
    logOn(userName, password, authenticationType);

    if (token === null) {
        log('The token was not received');
        return;
    }
    
    var offsetIncrement = 50;
    var offset = 0;
    var documents;
    do {
        offset += offsetIncrement;
        documents = queryDocuments(0,offset);
        
        $.each(documents, function (i, document) {
            processDocument(document);
        });
        
    } while(documents.length === offset)

    logOff();
});

function processDocument(document) {
    var documentId = document.id;
    $('.document').clone().attr("id","document-" + documentId).appendTo('html');
    
//    var document = queryDocument(documentId);
    renderDocumentName(document.name,document.description);

    var varList = queryVariables(documentId);
    variables(documentId, varList);

    var providers = queryDataProviders(documentId);
    dataProviders(documentId, providers);

    changeUniverseIdsByNames();
}

function log(log) {
    $('#logs').append('<p>' + log + '</p>');
}

function logOn(userName, password, authenticationType) {
    var logonRequest = new XMLHttpRequest();
    logonRequest.open('POST', logonRequestUrl(), false);
    logonRequest.setRequestHeader('X-PINGARUNER', 'pingpong');
    logonRequest.setRequestHeader('Content-Type', 'application/xml');
    logonRequest.setRequestHeader('Accept', 'application/xml');
    logonRequest.send(logonBody(userName, password, authenticationType));

    token = logonRequest.getResponseHeader('X-SAP-LogonToken');
}

function logonBody(userName, password, authenticationType) {
    return '<?xml version="1.0"?><attrs xmlns="http://www.sap.com/rws/bip"><attr name="userName" type="string">'
        + userName + '</attr><attr name="password" type="string">'
        + password + '</attr><attr name="auth" type="string">'
        + authenticationType + '</attr></attrs>';
}

function queryDocuments(offset,limit) {
    var documentsRequest = new XMLHttpRequest();
    documentsRequest.open('GET', documentsRequestUrl(offset,limit), false);
    setHeaders(documentsRequest);
    setToken(documentsRequest);
    documentsRequest.send();

    return JSON.parse(documentsRequest.responseText).documents.document;
}

function queryVariables(documentId) {
    var variablesRequest = new XMLHttpRequest();
    variablesRequest.open('GET', variablesRequestUrl(documentId), false);
    setHeaders(variablesRequest);
    setToken(variablesRequest);
    variablesRequest.send();

    var parent = JSON.parse(variablesRequest.responseText);
    return parent.variables;
}

function queryDataProviders(documentId) {
    var providersRequest = new XMLHttpRequest();
    providersRequest.open('GET', dataProvidersRequestUrl(documentId), false);
    setHeaders(providersRequest);
    setToken(providersRequest);
    providersRequest.send();

    var parent = JSON.parse(providersRequest.responseText);
    return parent.dataproviders;
}

function variables(documentId, variables) {
    console.log(variables);
    $.each(variables, function (i, varr) {
        console.log(varr);
        renderVariableFunction(documentId,queryVariable(documentId, varr.id));
    });
}

function dataProviders(documentId, dataProviders) {
    var provider = null;
    $.each(dataProviders, function (i, provider) {
        provider = queryDataProvider(documentId, provider.id)
        renderDataProviderFunction(documentId,provider);
        renderObjectsFunction(documentId,provider);
        renderSqlQueryFunction(documentId,provider);
    });
}

function queryVariable(documentId, variableId) {
    var variableRequest = new XMLHttpRequest();
    var url = variableRequestUrl(documentId, variableId);
    variableRequest.open('GET', url, false);
    setHeaders(variableRequest);
    setToken(variableRequest);
    variableRequest.send();
    var parent = JSON.parse(variableRequest.responseText);
    return parent.variable;
}

function queryDataProvider(documentId, providerId) {
    var variableRequest = new XMLHttpRequest();
    var url = dataProviderRequestUrl(documentId, providerId);
    variableRequest.open('GET', url, false);
    setHeaders(variableRequest);
    setToken(variableRequest);
    variableRequest.send();
    var parent = JSON.parse(variableRequest.responseText);
    return parent.dataprovider;
}

function queryUniverse(documentId, universeId) {
    var universeRequest = new XMLHttpRequest();
    var url = universeRequestUrl(documentId, universeId);
    universeRequest.open('GET', url, false);
    setHeaders(universeRequest);
    setToken(universeRequest);
    universeRequest.send();
    var parent = JSON.parse(universeRequest.responseText);
    return parent.universe;
}

function logOff() {
    var logoffRequest = new XMLHttpRequest();

    logoffRequest.open('POST', logoffRequestUrl(), false);
    setHeaders(logoffRequest);
    setToken(logoffRequest);
    logoffRequest.send();
}

function setHeaders(request) {
    request.setRequestHeader('X-PINGARUNER', 'pingpong');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Accept', 'application/json');
}

function setToken(request) {
    request.setRequestHeader('X-SAP-LogonToken', token);
}

function renderDocumentName(documentId,name,description) {
    var tableRow = '<tr><td>' + name + '</td><td class="description">'
        + description + '</td></tr>';
    $('document-' + documentId).find('.documentDef').append(tableRow);
}

function renderVariable(documentId,variable) {
    var tableRow = '<tr><td>' + variable.name + '</td><td>'
        + variable['@qualification'] + '</td><td>'
        + variable.definition + '</td></tr>';
    $('document-' + documentId).find('.variables').append(tableRow);
}

function renderDataProvider(documentId,provider) {
    var tableRow = '<tr><td>' + provider.name + '</td><td class="universe">'
        + provider.dataSourceId + '</td></tr>';
    $('document-' + documentId).find('.dataproviders').append(tableRow);
}

function renderSqlQuery(documentId,provider) {
    var tableRow = '<tr><td>' + provider.name + '</td><td>'
        + provider.query + '</td></tr>';
    $('document-' + documentId).find('.sqlqueries').append(tableRow);
}

function renderObjects(documentId,provider) {
    var dictionary = provider.dictionary.expression;
    var tableRow = '';
    $.each(dictionary, function (i, object) {
        tableRow = '<tr><td>' + object.name + '</td><td class="universe">'
            + provider.dataSourceId + '</td></tr>';
        $('document-' + documentId).find('.objects').append(tableRow);
    });
}

function logonRequestUrl() {
    return http + server + ':' + port + '/biprws/logon/long';
}

function documentsRequestUrl(offset,limit) {
    return http + server + ':' + port + '/biprws/raylight/v1/documents?offset=' 
        + offset + '&limit=' + limit;
}

function variablesRequestUrl(documentId) {
    return http + server + ':' + port + '/biprws/raylight/v1/documents/'
        + documentId + '/variables';
}

function dataProvidersRequestUrl(documentId) {
    return http + server + ':' + port + '/biprws/raylight/v1/documents/'
        + documentId + '/dataproviders';
}

function variableRequestUrl(documentId, variableId) {
    return http + server + ':' + port + '/biprws/raylight/v1/documents/'
        + documentId + '/variables/' + variableId;
}

function dataProviderRequestUrl(documentId, providerId) {
    return http + server + ':' + port + '/biprws/raylight/v1/documents/'
        + documentId + '/dataproviders/' + providerId;
}

function universeRequestUrl(documentId, universeId) {
    return http + server + ':' + port + '/biprws/raylight/v1/universes/'
        + universeId;
}

function logoffRequestUrl() {
    return http + server + ':' + port + '/biprws/logoff';
}

function changeUniverseIdsByNames() {
    var universe = null;
    $('.universe').each(function () {
        universe = queryUniverse(documentId, $(this).text());
        $(this).text(universe.name);
    });
}