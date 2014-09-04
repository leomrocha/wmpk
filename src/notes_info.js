
//Assumes Synesthesia from MIDI.js is pressent

//Copyright Leonardo M. Rocha 2014 and beyond
/**
 *
 *All the notes, this will be initialized to contain all the MIDI notes with 
 *descriptions about synesthesia and other data to be able to play and modify
 *graphic elements as well as play
 *
 *
 **/
LeosPiano.Notes = {}


LeosPiano.Notes.WHITE = 'white';
LeosPiano.Notes.BLACK = 'black';
LeosPiano.Notes.FLAT = 'flat';
LeosPiano.Notes.SHARP = 'sharp';

/*mapping if alterations exists to black or white
 *1 and 2 is for the lenght of the names in the LeosPiano.Notes.names object, 
 *if has more than 1 is altered, hence black
 */
LeosPiano.Notes.colors = {
    1: LeosPiano.Notes.WHITE,
    2: LeosPiano.Notes.BLACK
};

LeosPiano.Notes.names = {
    0: ['C'],
    1: ['C#', 'Db'],
    2: ['D'],
    3: ['D#', 'Eb'],
    4: ['E'],
    5: ['F'],
    6: ['F#', 'Gb'],
    7: ['G'],
    8: ['G#', 'Ab'],
    9: ['A'],
    10: ['A#', 'Bb'],
    11: ['B']
};

LeosPiano.Notes.names_latin = {
    0: ['Do'],
    1: ['Do#', 'Re-b'],
    2: ['Re'],
    3: ['Re#', 'Mi-b'],
    4: ['Mi'],
    5: ['Fa'],
    6: ['Fa#', 'Sol-b'],
    7: ['Sol'],
    8: ['Sol#', 'La-b'],
    9: ['La'],
    10: ['La#', 'Si-b'],
    11: ['Si']
};


/**
 * Get synesthesia color in [R,G,B] with note number and synesthesia name
 **/
LeosPiano.Notes.get_synesthesia = function(note_number, syn_name){
    var syn = MusicTheory.Synesthesia.data[syn_name][note_number];
    return syn;
}

/**
 * Initializes all the notes in the MIDI range
 * TODO make possible to only give a range of notes to initialize
 **/
LeosPiano.Notes.init = function(){
    //TODO check for Synesthesia present ...and do the things
    LeosPiano.Notes.notes = {};
    for (var i=0; i<128; i++){
        //the whole note structure
        var note = {};

        note.midi_id = i;
        //note.octave = Math.floor(i/12) - 5; //octave with MIDI notation
        note.octave = Math.floor(i/12);
        note.number = i%12;
        note.names = LeosPiano.Notes.names[note.number]
        note.key_color = note.names.length <=1 ? LeosPiano.Notes.WHITE : LeosPiano.Notes.BLACK;
        note.mapping = 
        //TODO synesthesia
        //synesthesia should be calculated at the time
        //note.synestesia = LeosPiano.Notes.get_synesthesia(note.number, "");
        //note.get_synesthesia_color = ;
        //note.synesthesia_color_off = ;
        
        //console.log("note = ", note);
        LeosPiano.Notes.notes[note.midi_id] = note;
        }

};

LeosPiano.Notes.init();
