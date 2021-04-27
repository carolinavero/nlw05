// SPA
// useEffect - efeitos colaterais
// usaria useEffect + fetch pra pegar os dados da API
// problema: não aparece pros mencanismos de busca
// não exibe informacoes assim q o usuário abre a tela

// SSR
// getServerSideprops executa toda vez que alguem acessa a pag da aplicacao
// 

// SSG
// gera uma versao estatica da pagina depois que uma pessoa acessa pela 1ª vez
// mais performance
// só trocar getServerSideProps por
// e chamar o revalidate
// só funciona em producao, precisa gerar uma build do projeto

import { GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss'
import { usePlayer } from '../contexts/PlayerContext';

type Episode = { 
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  // episodes: Array<Episode>
  latestEpisodes: Episode[]; //array de objetos
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {

  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>

      <Head>
        <title>Home | Podcastr </title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" key="viewport"></meta>
        <meta name="theme-color" content="#8257e5"></meta>
      </Head>
      
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos </h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <div className="img-box">
                  <Image width={192} height={192} 
                    src={episode.thumbnail} 
                    alt={episode.title} 
                    objectFit="cover" 
                    className={styles.episodeThumb} 
                  />
                </div>

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}

        </ul>
      </section>
      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          {/* <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}>
                    <td style={{ width: 72 }}>
                      <Image 
                        width={120} 
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                         <img src="/play-green.svg" alt="Tocar episódio"/>
                      </button>  
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table> */}

          <div className={styles.allEpisodesListTable}>
            <div className={styles.listHeader}>
                <div>Podcast</div>
                <div>Integrantes</div>
                <div>Data</div>
                <div>Duração</div>
            </div>

            <div className={styles.listContent}>
              {allEpisodes.map((episode, index) => {
                return (
                  <div key={episode.id} className={styles.listContentInfo}>
                    <div style={{ width: 72 }}>
                      <Image 
                        width={120} 
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                        className={styles.episodeThumb}
                      />
                    </div>
                    <div  style={{ width: 360 }}>
                      <Link href={`/episodes/${episode.id}`}>
                        <a >{episode.title}</a>
                      </Link>
                    </div>
                    <div style={{ width: 250 }}>{episode.members}</div>
                    <div style={{ width: 100 }}>{episode.publishedAt}</div>
                    <div>{episode.durationAsString}</div>
                    <div>
                      <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                         <img src="/play-green.svg" alt="Tocar episódio"/>
                      </button>  
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

      </section>
    </div>
  )
}
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { 
        locale: ptBR 
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url
    }
  });

  const latestEpisodes = episodes.slice(0, 2); // 2 ultimos ep
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8, // 60 seg X 60 = 1h X 8 = a cada 8h gera uma nova versao da pag, 3x ao dia
  }
}
