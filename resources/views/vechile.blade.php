@extends('layouts.app')
@section('title', config('app.name') . ' | FleetComplete')
@section('content')
<!--@begin API input field -->
<form class="form-inline">
    {{ csrf_field() }}
    <div class="form-group mx-sm-4 mb-2">
        <label for="API Key" class="label"> API key: </label>
        <input type="text" class="form-control" name="apiKey" id="apiKey" placeholder="(api key goes here)">
        <button type="button" class="btn btn-primary ml" id="go">Go</button>
    </div>
    </div>
</form>
<div class="myAlert-top alert alert-danger" id="ajax-alert">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
    <strong>Error!</strong>
</div>
<!-- @ends API input field -->
<hr>
<!--@begin map div -->
<div class="col-md-7 float-right" id="mapData">
    @include('partials.sidebar')
</div>
<!-- @ends map div -->

<!--@begin vechile list data -->
<div class="row">
    <div class="col-md-10">
        <table class="table table-striped vehicleDataTable table-dark" id="tbdata">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Speed</th>
                    <th scope="col">Last update</th>
                    <th scope="col" style="display:none">ID</th>
                </tr>
            </thead>
            <tbody>
                <tr id="noData">
                    <td></td>
                    <td>No Data</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
<!--@ends vechile list data -->

<!--@begin date picker  -->
<form class="form-inline " id="editEventForm">
    <div class="form-group mx-sm-4 mb-2" id="dateInput" style="display:none">
        <div class="row">
            <label for="date" class="label"> Date : </label>
            <input class="date form-control" id="date" name="date" type="text"><i class="fas fa-calendar-alt"></i>
            <button type="button" class="btn btn-primary ml" id="selectedDate">Go</button>
        </div>
    </div>
</form>
<!--@end date picker  -->

<div id="overlay">
    <div class="cv-spinner">
        <span class="spinner"></span>
    </div>
</div>
<!--@begin   -->
<div class="row">
    <div class="col-md-10">
        <table class="table table-striped vehicleDetailsTable table-dark" id="vcdata">
        </table>
    </div>
</div>
<!--@end vehicle KM data  -->
@endsection