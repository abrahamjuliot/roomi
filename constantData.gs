// @require Calendar API
function constantData() {
  return {
    formURL: 'https://script.google.com/macros/s/AKfycbwOdMKpTe8Voj2mI2lAnobmEwD-oDYC4GDn7s7f8g/exec',
    executionURL: 'https://script.google.com/home/projects/1VqwWh3GNpgCzbKU7vRTuajT-RH6-LBKklv4LkLVYEZSoWpc59iiRYREG/executions',
    database: '1RtADhwTaDyLAPGSJp0JeS1FaRVzZskPY6HSZRR9A7VA',
    admin: {
      title: 'Admin',
      email: 'abeletter@gmail.com'
    },
    calendar: [
      {
        name: '217',
        capacity: 16,
        viewLink: 'https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=America%2FLos_Angeles&showTabs=1&showCalendars=0&showPrint=0&showTz=0&mode=WEEK&src=Y2xhc3Nyb29tMTE0MDE5ODA1ODM5ODM4Mzc3Njc5QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23227F63',
        id: 'classroom114019805839838377679@group.calendar.google.com',
        app: function() { return CalendarApp.getCalendarById(this.id) }
      },
      {
        name: '301',
        capacity: 18,
        viewLink: 'https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=America%2FLos_Angeles&showTabs=1&showCalendars=0&showPrint=0&showTz=0&src=azI5NXAzbTlvMDNjcW9idDY3NGxnam5hc3NAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%237fbb&mode=WEEK',
        id: 'k295p3m9o03cqobt674lgjnass@group.calendar.google.com',
        app: function() { return CalendarApp.getCalendarById(this.id) }
      },
      {
        name: '311',
        capacity: 6,
        viewLink: 'https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=America%2FLos_Angeles&showTabs=1&showCalendars=0&showPrint=0&showTz=0&mode=WEEK&src=bGd0cGRpdDVwdWFldWljMTduZGJtbG41c3NAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23402175',
        id: 'lgtpdit5puaeuic17ndbmln5ss@group.calendar.google.com',
        app: function() { return CalendarApp.getCalendarById(this.id) }
      }
    ]
  }
}
