package com.commuhub

import android.content.ContentValues
import android.provider.CalendarContract
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class CalendarModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "CalendarModule"

    @ReactMethod
    fun addEventToCalendar(details: ReadableMap, promise: Promise) {
        try {
            val cr = reactApplicationContext.contentResolver
            val startMillis = details.getDouble("startDate").toLong()
            val endMillis = details.getDouble("endDate").toLong()

            val calendarId = findUserCalendar()

            val eventValues = ContentValues().apply {
                put(CalendarContract.Events.CALENDAR_ID, calendarId)
                put(CalendarContract.Events.DTSTART, startMillis)
                put(CalendarContract.Events.DTEND, endMillis)
                put(CalendarContract.Events.TITLE, details.getString("title") ?: "")
                put(CalendarContract.Events.EVENT_LOCATION, details.getString("location") ?: "")
                put(CalendarContract.Events.DESCRIPTION, details.getString("description") ?: "")
                put(CalendarContract.Events.EVENT_TIMEZONE, details.getString("timeZone") ?: "UTC")
                put(CalendarContract.Events.ALL_DAY, 0)
                put(CalendarContract.Events.STATUS, CalendarContract.Events.STATUS_CONFIRMED)
            }

            val uri = cr.insert(CalendarContract.Events.CONTENT_URI, eventValues)
            if (uri != null) {
                val eventId = uri.lastPathSegment
                Log.d("CalendarModule", "Evento criado no calendário $calendarId, ID: $eventId")
                promise.resolve(eventId)
            } else {
                promise.reject("INSERT_FAILED", "Falha ao inserir evento no calendário")
            }
        } catch (e: SecurityException) {
            promise.reject("NO_PERMISSION", "Permissão de calendário não concedida")
        } catch (e: Exception) {
            Log.e("CalendarModule", "Erro ao adicionar evento", e)
            promise.reject("CALENDAR_ERROR", e.message ?: "Erro desconhecido")
        }
    }

    private fun findUserCalendar(): Long {
        val cr = reactApplicationContext.contentResolver
        val projection = arrayOf(
            CalendarContract.Calendars._ID,
            CalendarContract.Calendars.OWNER_ACCOUNT,
            CalendarContract.Calendars.NAME
        )

        // Excluir calendários de feriados e o nosso próprio "commuhub"
        val excludeHolidays = "${CalendarContract.Calendars.OWNER_ACCOUNT} NOT LIKE '%holiday%'"
        val excludeOurs = "${CalendarContract.Calendars.NAME} != 'commuhub'"
        val hasEmail = "${CalendarContract.Calendars.OWNER_ACCOUNT} LIKE '%@%'"
        val selection = "$excludeHolidays AND $excludeOurs AND $hasEmail"

        var cursor = cr.query(
            CalendarContract.Calendars.CONTENT_URI,
            projection,
            selection,
            null,
            "${CalendarContract.Calendars._ID} ASC"
        )
        cursor?.use {
            if (it.moveToFirst()) {
                val id = it.getLong(0)
                val owner = it.getString(1) ?: ""
                Log.d("CalendarModule", "Calendário do utilizador: $id ($owner)")
                return id
            }
        }

        // Fallback: qualquer calendário com email
        cursor = cr.query(
            CalendarContract.Calendars.CONTENT_URI,
            projection,
            "${CalendarContract.Calendars.OWNER_ACCOUNT} LIKE '%@%'",
            null,
            "${CalendarContract.Calendars._ID} ASC"
        )
        cursor?.use {
            if (it.moveToFirst()) {
                val id = it.getLong(0)
                Log.d("CalendarModule", "Fallback calendário com email: $id")
                return id
            }
        }

        // Fallback: primeiro calendário
        cursor = cr.query(
            CalendarContract.Calendars.CONTENT_URI,
            projection,
            null,
            null,
            "${CalendarContract.Calendars._ID} ASC"
        )
        cursor?.use {
            if (it.moveToFirst()) {
                val id = it.getLong(0)
                Log.d("CalendarModule", "Fallback primeiro calendário: $id")
                return id
            }
        }

        throw Exception("Nenhum calendário encontrado no dispositivo")
    }
}
