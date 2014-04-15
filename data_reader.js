/* We assume that the data to read is a csv file (actually ;) of the following format :
date; commune; longitude; latitude 
The data is a lines 2D array*/

var Dico = {};
for (var i = 0 ; i < lines.length ; i++) {
	if Dico[lines[i][1]] {
		Dico[lines[i][1]][0]++;
	}
	else {
		Dico[lines[i][1]][0] = 1;
		Dico[lines[i][1]][1] = lines[i][2];
		Dico[lines[i][1]][2] = lines[i][3];
	}
}