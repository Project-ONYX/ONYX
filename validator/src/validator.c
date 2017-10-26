#include <openssl/pem.h>
#include <openssl/ssl.h>
#include <openssl/rsa.h>
#include <openssl/evp.h>
#include <openssl/bio.h>
#include <openssl/err.h>

#include "encrypt.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Helper function that concatenates 3 strings
char* concat(const char *s1, const char *s2, const char *s3) {
	char *result = malloc(strlen(s1) + strlen(s2) + strlen(s3) + 1);
	strcpy(result, s1);
	strcat(result, s2);
	strcat(result, s3);
	return result;
}

int main( int argc, char *argv[] ) {
	// Retrieve Command Line Arguments
	if(argc < 2) {
		printf("Usage: validator.o [PATH TO FILE]\n");
		exit(1);
	}
	char* path = argv[1];

	// Create the shell command to run tests
	char* cmd = concat("cd ", path, " && npm install && truffle test");
	printf("%s\n",cmd);

	// Initialize the shell pipe and buffer
	FILE *in;
	extern FILE *popen();
	char buff[512];

	// Run the shell command 
	if(!(in = popen(cmd, "r"))) {
		exit(1);
	}

	// Retrieve the output from the shell command
	while(fgets(buff, sizeof(buff), in)!=NULL) {
		printf("%s", buff);
	}

	// Close the shell pipe
	pclose(in);

	return 0;
}