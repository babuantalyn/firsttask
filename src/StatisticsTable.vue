<script>
import "bootstrap/dist/css/bootstrap.min.css";
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
} from "@coreui/bootstrap-vue";

</script>

<template>
    <div>
    <CTable v-if="selectedProperty">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell scope="col">Property</CTableHeaderCell>
          <CTableHeaderCell scope="col">Minimum</CTableHeaderCell>
          <CTableHeaderCell scope="col">Maximum</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow>
          <CTableHeaderCell scope="row">{{ selectedProperty}}</CTableHeaderCell>
          <CTableDataCell>{{ range.min }}</CTableDataCell>
          <CTableDataCell>{{ range.max }}</CTableDataCell>

        </CTableRow>
      </CTableBody>
    </CTable>
  </div>
</template>