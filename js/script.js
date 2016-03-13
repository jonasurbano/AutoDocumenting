var http = "http://";
var token = null;

$(document).ready(function () {
    renderVariableFunction = renderVariable;
    renderDataProviderFunction = renderDataProvider;
    
    logOn(userName, password, authenticationType);

    if (token === null) {
        log('The token was not received');
        return;
    }
    
    queryDataProviders(documentId);
    
    var varList = queryVariables(documentId);
    variables(documentId, varList);

    var providers = queryDataProviders(documentId);
    dataProviders(documentId, providers);

    logOff();
});

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
    $.each(variables, function(i, varr) {
        renderVariableFunction(queryVariable(documentId, varr.id));
    });
}

function dataProviders(documentId, dataProviders) {
    $.each(dataProviders, function(i, provider) {
        renderDataProviderFunction(queryDataProvider(documentId, provider.id));
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

function renderVariable(variable) {
    var tableRow = '<tr><td>' + variable.name + '</td><td>' 
        + variable['@qualification'] + '</td><td>' 
        + variable.definition + '</td></tr>';
    $('#variables').append(tableRow);
}

function renderDataProvider(provider) {
    var tableRow = '<tr><td>' + provider.name + '</td><td>' + provider.dataSourceId + '</td></tr>';
    $('#dataproviders').append(tableRow);
}

function logonRequestUrl() {
    return http + server + ':' + port + '/biprws/logon/long';
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

function logoffRequestUrl() {
    return http + server + ':' + port + '/biprws/logoff';
}
