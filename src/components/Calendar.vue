<template>
    <div class="container">
         <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn outlined class="mr-4" color="grey darken-2" @click="dialog = true">
              Add
          </v-btn>  
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            Today
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                outlined
                color="grey darken-2"
                v-bind="attrs"
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          
        ></v-calendar>
        <!-- MODAL -->
        <v-dialog v-model="dialog">
            <v-card>
                <v-container>
                    <v-form @submit.prevent="addEvent">
                        <v-text-field 
                            type="text" label="Add name" v-model="name">
                        </v-text-field>
                        <v-text-field 
                            type="text" label="Add detail" v-model="details">
                        </v-text-field>
                        <v-text-field 
                            type="date" label="From" v-model="start">
                        </v-text-field>
                        <v-text-field 
                            type="date" label="To" v-model="end">
                        </v-text-field>
                        <v-text-field 
                            type="color" label="Chose a color" v-model="color">
                        </v-text-field>
                        <v-btn 
                            type="submit" 
                            color="primary" 
                            class="mr-4"
                            @click.stop="dialog = false">
                            Add event
                        </v-btn>
                    </v-form>
                </v-container>
            </v-card>
        </v-dialog>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-btn icon @click="delteEvent(selectedEvent)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
              
            </v-toolbar>
            <v-card-text>
             <v-form v-if="currentlyEditing !== selectedEvent.id">
               
             </v-form>
             <v-form v-else>
               <v-text-field 
                type="text" v-model="selectedEvent.name"
                label="edit name"
                >
                <textarea-autosize 
                  v-model="selectedEvent.details"
                  type="text"
                  style="width: 100%"
                  :min-height="100"
                  >

                </textarea-autosize>
               </v-text-field>
             </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false"
              >
                Cancel
              </v-btn>
              <v-btn
                v-if="currentlyEditing !== selectedEvent.id"
                text
                color="secondary"
                @click.prevent="editEvent(selectedEvent.id)"                
              >
                Edit
              </v-btn>

              <v-btn 
                v-else
                text
                @click.prevent="updateEvent(selectedEvent)"
              >Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
    </div>
</template>





<script>
import {db} from '../main';
  export default {
    data: () => ({
      focus: '',
      type: 'month',
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        '4day': '4 Days',
      },
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
    //   names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
      details : null,
      name : null,
      color:'#1976D2',
      dialog:false,
      currentlyEditing:null,
      start : null,
      end : null
    }),
    mounted () {
      this.$refs.calendar.checkChange();
    },
    created(){
      this.getEvent();
    },
    methods: {
      async updateEvent(ev){
        try {
          await db.collection('events').doc(ev.id).update({
            name: ev.name,
            details: ev.details
          });
          this.selectedOpen = false;
          this.currentlyEditing=null;
        } catch (error) {
          console.log(error)
        }
      },
      editEvent(id){
        this.currentlyEditing=id;
      },
      async delteEvent(e){
        try {
          await db.collection('events').doc(e.id).delete();
          this.selectedOpen = false;
          this.getEvent();
        } catch (error) {
          console.log(error);
        }
      },
      async addEvent(){
          try {
              if(this.name && this.start && this.end){
                  await db.collection('events').add({
                      name:this.name,
                      details: this.details,
                      start: this.start,
                      end: this.end,
                      color:this.color
                  });
                  this.getEvent();

                  this.name = null;
                  this.details = null;
                  this.start = null;
                  this.end = null;
                  this.color = "#1976D2";
              }
          } catch (error) {
              console.log(error);
          }
      },
      async getEvent(){
          try {
            const snapchot = await db.collection('events').get();
            const events = [];
            snapchot.forEach(doc =>{
                // console.log(doc.data());
                let eventData= doc.data();
                eventData.id =doc.id;
                events.push(eventData);
                this.events = events;
            });
          } catch (error) {
              console.log(error);
              
          }
        },
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      setToday () {
        this.focus = ''
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          setTimeout(() => this.selectedOpen = true, 10)
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          setTimeout(open, 10)
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },      
    },
  }
</script>