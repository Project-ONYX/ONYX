#include <openssl/pem.h>
#include <openssl/ssl.h>
#include <openssl/rsa.h>
#include <openssl/evp.h>
#include <openssl/bio.h>
#include <openssl/err.h>
#include <time.h>
#include <stdio.h>

int padding = RSA_PKCS1_PADDING;

RSA * createRSA(unsigned char * key,int public)
{
	RSA *rsa= NULL;
	BIO *keybio ;
	keybio = BIO_new_mem_buf(key, -1);
	if (keybio==NULL)
	{
		printf( "Failed to create key BIO");
		return 0;
	}
	if(public)
	{
		rsa = PEM_read_bio_RSA_PUBKEY(keybio, &rsa,NULL, NULL);
	}
	else
	{
		rsa = PEM_read_bio_RSAPrivateKey(keybio, &rsa,NULL, NULL);
	}
	if(rsa == NULL)
	{
		printf( "Failed to create RSA");
	}
	
	return rsa;
}

int public_encrypt(unsigned char * data,int data_len,unsigned char * key, unsigned char *encrypted)
{
	RSA * rsa = createRSA(key,1);
	int result = RSA_public_encrypt(data_len,data,encrypted,rsa,padding);
	return result;
}

int private_decrypt(unsigned char * enc_data,int data_len,unsigned char * key, unsigned char *decrypted)
{
	RSA * rsa = createRSA(key,0);
	int result = RSA_private_decrypt(data_len,enc_data,decrypted,rsa,padding);
	return result;
}

int private_encrypt(unsigned char * data,int data_len,unsigned char * key, unsigned char *encrypted)
{
	RSA * rsa = createRSA(key,0);
	int result = RSA_private_encrypt(data_len,data,encrypted,rsa,padding);
	return result;
}

int public_decrypt(unsigned char * enc_data,int data_len,unsigned char * key, unsigned char *decrypted)
{
	RSA * rsa = createRSA(key,1);
	int result = RSA_public_decrypt(data_len,enc_data,decrypted,rsa,padding);
	return result;
}

void en_de_crypt(int should_encrypt, FILE *ifp, FILE *ofp, unsigned char *ckey, unsigned char *ivec) {

    const unsigned BUFSIZE=4096;
    unsigned char *read_buf = malloc(BUFSIZE);
    unsigned char *cipher_buf;
    unsigned blocksize;
    int out_len;
    EVP_CIPHER_CTX ctx;

    EVP_CipherInit(&ctx, EVP_aes_256_cbc(), ckey, ivec, should_encrypt);
    blocksize = EVP_CIPHER_CTX_block_size(&ctx);
    cipher_buf = malloc(BUFSIZE + blocksize);

    while (1) {

        // Read in data in blocks until EOF. Update the ciphering with each read.

        int numRead = fread(read_buf, sizeof(unsigned char), BUFSIZE, ifp);
        EVP_CipherUpdate(&ctx, cipher_buf, &out_len, read_buf, numRead);
        fwrite(cipher_buf, sizeof(unsigned char), out_len, ofp);
        if (numRead < BUFSIZE) { // EOF
            break;
        }
    }

    // Now cipher the final block and write it out.

    EVP_CipherFinal(&ctx, cipher_buf, &out_len);
    fwrite(cipher_buf, sizeof(unsigned char), out_len, ofp);

    // Free memory

    free(cipher_buf);
    free(read_buf);
}

unsigned char * generate_IV(int size) {
	srand((unsigned int)time(NULL));
	unsigned char *str = malloc(size * sizeof(unsigned char));
	sprintf(str, "%d", rand());
	return str;
}

void printLastError(char *msg)
{
	char * err = malloc(130);;
	ERR_load_crypto_strings();
	ERR_error_string(ERR_get_error(), err);
	printf("%s ERROR: %s\n",msg, err);
	free(err);
}

int main(int argc, char *argv[]){
	char plainText[2048/8] = "Hello this is Ravi"; //key length : 2048

	char publicKey[]="-----BEGIN PUBLIC KEY-----\n"\
"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAywLnYEPTZqTrkbxKtEdz\n"\
"LvxYj5AySGMGenjLofIaYEfsYgvqpVXTqz2BBS8+96kumbUHENQCoXm+cb9PF6hO\n"\
"uTlk+vsw5MPwsNg7uMyK8/9NOWI68hzfGNs1BFlKIuyEuvqbyGYyazU6F2PPbQzN\n"\
"nUHeh8ZwkCpz3nd5WaqbiHxx5uiFMKmUWkvBNDukBp2Nb5wyeIIBubQ6ykbiQlwv\n"\
"RKIIhxk+0h7GXal1bSS9uctYtcWmUluN0nJAznpGYakmMhzUXhYdh6CA5D6ZWdCB\n"\
"TVlUhU+VKznqYzPl9hM85x/xQfNzIVAvS9n+bdWMXu0MakqAejEow8rKj3eq83Hn\n"\
"JQIDAQAB\n"\
"-----END PUBLIC KEY-----\n";

	char privateKey[]="-----BEGIN RSA PRIVATE KEY-----\n"\
"MIIEowIBAAKCAQEAywLnYEPTZqTrkbxKtEdzLvxYj5AySGMGenjLofIaYEfsYgvq\n"\
"pVXTqz2BBS8+96kumbUHENQCoXm+cb9PF6hOuTlk+vsw5MPwsNg7uMyK8/9NOWI6\n"\
"8hzfGNs1BFlKIuyEuvqbyGYyazU6F2PPbQzNnUHeh8ZwkCpz3nd5WaqbiHxx5uiF\n"\
"MKmUWkvBNDukBp2Nb5wyeIIBubQ6ykbiQlwvRKIIhxk+0h7GXal1bSS9uctYtcWm\n"\
"UluN0nJAznpGYakmMhzUXhYdh6CA5D6ZWdCBTVlUhU+VKznqYzPl9hM85x/xQfNz\n"\
"IVAvS9n+bdWMXu0MakqAejEow8rKj3eq83HnJQIDAQABAoIBAHx1MUgxDL9WyBy2\n"\
"ZM4VJ6Zciiapbko2e1hGCgEkncr9DQwm5hmqfnPy5tA44M+QZsNQ2h4U++/m5Txy\n"\
"3phQVML1TtUXfighf8PLLQHkVCO2Fq/hauXXkWZ5rQ0XeH3kppLC5RJ8pNhY7147\n"\
"kIT4Xm3UXgq7O3MGs7ZlZH32PBf1qzBPJNn34rOyJe+aXE+rjm0ywGMc6Fj6HAVX\n"\
"Ki6gbv944L1BHxH8Rc8MqaN/GCzBRzna6ljqgg0ATWR2MLUFz0nANVeF9EJY0uyJ\n"\
"5P1SvZW7PkB02bIAr/lPI93XopXBcW+VleBAK5vXElnnLGuCivEFvvWXsoWxuFZC\n"\
"vaLwLUECgYEA8BzncD/sNWKPLerfaXmidx/TBh5yr+JdYcIRPhQyV2SYU1lra4Bq\n"\
"Pm9LjKzMGJ/kGMjL1NYX0nuHZWMaJ+fm1xjQHBmcNQ+s0ioq/3V2v2Ys4ho/qZff\n"\
"6TjJpTibTVLWVrcy104duK1So7VspC3xZIcEq5rD5yZwlivBZ3C2j/kCgYEA2HGQ\n"\
"S9gaLRSU/zyQab0p/p34noHPh7u4vELfQfGQrxwmGTMfDCw0tE69yQuG6vyCDiss\n"\
"yklZhEQhrR5BdsdmjifKwbmHH8+OHEJv9GziS8hN2OORiAG+iVpv+tmBxV1WmCCB\n"\
"SmwAa90lGjUk6B+Oi3xag5ZnTfD46M8kz/tmM40CgYACi9vsddEUc9oe24nI/ZA6\n"\
"gSzkuLfwo47n9X3nUaGDCb8Pyzf3aOI3jUiY0lBLxo5NsPtwY2DXS5YQ/i8N00jA\n"\
"aTPzyFW+vk7P38Ca+uzqdLPvJeYc705hk8eXp/UFqeY5/zFb1Sk9hyEEOW1QhGg1\n"\
"77Sd+UMwlVjGTup7JVfaSQKBgQDIXqlUbSQeY5Vji6+tE59SxO8p3cY/Q3tLXSTN\n"\
"KVHlqctjPL4bSLkpylNLUM5/r26+qx11zt194ozCdOXpjcLVCuVa3ePHgR9v7dky\n"\
"j7IWscHPbSyGmgbHpN9RfBX0nenSPxUxzjW9pSX50wTtlnkhi+dHNe9AajojW9Aa\n"\
"cgM06QKBgHuuUnqgUGtLAHuMx4dzAMHI0fHpqWkn/Lq6zr+yasUWLvTbsRI+Shaz\n"\
"I15epaauOQCOzxGkUKjz+JzEZvWY0war2y75r8BYDrqYBKgyn/CL3hLza7lp82pS\n"\
"oTGJK6CzYrpFFqkzhEsoxJ//XbKeD3pbsCkSPuWRWdgFkv+eIxU3\n"\
"-----END RSA PRIVATE KEY-----\n";

	unsigned char encrypted[4098] = {};
	unsigned char decrypted[4098] = {};

	int encrypted_length= public_encrypt(plainText,strlen(plainText),publicKey,encrypted);
	if(encrypted_length == -1)
	{
		printLastError("Public Encrypt failed ");
		exit(0);
	}
	printf("Encrypted text = %s\n",encrypted);
	printf("Encrypted length = %d\n\n",encrypted_length);

	printf("------------------------------------------\n\n");

	int decrypted_length = private_decrypt(encrypted,encrypted_length,privateKey, decrypted);
	if(decrypted_length == -1)
	{
		printLastError("Private Decrypt failed ");
		exit(0);
	}
	printf("Decrypted Text = %s\n",decrypted);
	printf("Decrypted Length = %d\n",decrypted_length);

	printf("===================================================");

	unsigned char ckey[] = "private_key";
	unsigned char * ivec = generate_IV(20);
	FILE *fIN, *fOUT;

	if(argc != 2) {
		printf("Usage: <encrypt.o> /path/to/file");
		return -1;
	}
	char* path = argv[1];

	fIN = fopen(path, "rb");
	fOUT = fopen("encrypted.file", "wb");
	en_de_crypt(1, fIN, fOUT, ckey, ivec);

	fclose(fIN);
	fclose(fOUT);

	fIN = fopen("encrypted.file", "rb");
	fOUT = fopen("decrypted.file", "wb");

	en_de_crypt(0, fIN, fOUT, ckey, ivec);

	fclose(fIN);
	fclose(fOUT);
	free(ivec);

	return 0;
}